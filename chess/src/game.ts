import type { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Chess, type Square } from "chess.js";
import { logger } from "./lib/logger.js";

interface Player {
    id: string;
    socket: Socket;
    color: "White" | "Black";
}

interface Room {
    id: string;
    players: Player[];
    moveHistory: { san: string; fen: string; by: string }[];
    playerReadyCount: number;
    capturedPieces: string[];
    disconnectTimer?: NodeJS.Timeout | undefined;
    disconnectedPlayerId?: string | undefined;
}

export class GameManager {
    private readonly rooms: Map<string, Room> = new Map();
    private readonly games: Map<string, Chess> = new Map();

    private readonly disconnectTimeoutMs = 15000;

    public createRoom(socket: Socket) {
        const roomId = uuidv4();
        socket.join(roomId);

        const player: Player = {
            id: uuidv4(),
            socket,
            color: "White",
        };

        const room: Room = {
            id: roomId,
            players: [player],
            moveHistory: [],
            playerReadyCount: 0,
            capturedPieces: [],
        };

        this.rooms.set(roomId, room);

        socket.data.playerId = player.id;
        socket.data.roomId = room.id;

        socket.emit("room-created", {
            room: roomId,
            player_id: player.id,
            message: "Room Created Successfully",
        });

        logger.info(
            { roomId, playerId: player.id, socketId: socket.id },
            "Room created and host joined",
        );
    }

    public joinRoom(socket: Socket, roomId: string) {
        logger.info(
            { roomId, socketId: socket.id },
            "Player attempting to join room",
        );

        // Check if room exists.
        if (!this.rooms.has(roomId)) {
            socket.emit("error-room", {
                code: "ROOM_NOT_FOUND",
                message: `Room ${roomId} does not exist`,
            });
            logger.warn({ roomId }, "Join failed: room not found");
            return;
        }

        if (this.rooms.get(roomId)!.players.length >= 2) {
            socket.emit("room-full", {
                code: "room-full",
                message: "Room is full",
            });
            logger.warn({ roomId }, "Join failed: room full");
            return;
        }

        const player: Player = {
            id: uuidv4(),
            socket,
            color: "Black",
        };

        const room = this.rooms.get(roomId)!;
        room.players.push(player);

        socket.data.playerId = player.id;
        socket.data.roomId = room.id;

        socket.emit("room-joined", {
            room: roomId,
            player_id: player.id,
            message: "Room Joined Successfully",
        });

        logger.info(
            { roomId, playerId: socket.data.playerId },
            "Player joined room",
        );
    }

    public playerReady(socket: Socket, playerId: string) {
        // NOTE: Array.from is used so that we can safely call .find on the
        // Map values iterator across all supported Node.js versions.
        const room = Array.from(this.rooms.values()).find((r) =>
            r.players.some((p) => p.id === playerId),
        );

        if (!room) {
            logger.warn(
                { playerId },
                "Player ready failed: room not found",
            );
            return;
        }
        room.playerReadyCount++;
        logger.info(
            { roomId: room.id, playerId, readyCount: room.playerReadyCount },
            "Player marked ready"
        );
        
        if (room.playerReadyCount === 2) {
            logger.info(
                { roomId: room.id },
                "All players ready, starting game"
            );
            this.game(room.id);  
        }
    };

    public game(roomId: string) {
        const chess = new Chess();
        this.games.set(roomId, chess);
        const room = this.rooms.get(roomId)!;

        room.players.forEach((p) => {
            p.socket.emit("game-started", {
                color: p.color,
                board: chess.fen(),
                message: "game is started",
                playertoMove: chess.turn(),
            });

            // NOTE: We register move handlers after emitting the start event so
            // clients receive their initial board state before any move events.
            this.registerMove(roomId, p.socket, p.id);
        });
        logger.info({ roomId }, "Game started");
    }

    private registerMove(roomId: string, socket: Socket, playerId: string) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);

        socket.on(
            "move",
            ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
                logger.debug(
                    { roomId, playerId, from, to, promotion },
                    "Move received",
                );

                if (!chess || !this.rooms.get(roomId)) {
                    socket.emit("game-not-started", {
                        players: room?.players.length,
                    });
                    logger.warn("Game not started");
                    return;
                }

                // Check for the particular player.
                const player = room?.players.find((p) => p.id === playerId);
                if (!player) {
                    logger.warn({ playerId, roomId }, "Player not in this room");
                    return;
                }

            const turn = chess.turn() === "w" ? "White" : "Black";
            if (turn != player.color) {
                logger.warn(
                    { roomId, playerId, expectedTurn: turn },
                    "Player tried to move out of turn"
                );
                socket.emit("invalid-chance", {
                    message: "It is not your chance to move",
                    turn: chess.turn()
                })
                return;
            }

            try {
                const capturedPiece = chess.get(to as Square);
                const piece = chess.get(from as Square);
                const needPromotion =
                    piece?.type === "p" &&
                    ((piece.color === "w" && to[1] === "8") ||
                        (piece.color === "b" && to[1] === "1"));

                if (needPromotion && !promotion) {
                    socket.emit(
                        "promotion-required",
                        {
                            from,
                            to,
                            message: "Please select a piece for promotion",
                        },
                    );
                    return;
                }

                // Here, type is any because the underlying library accepts a
                // flexible move object; we keep this behavior but document it
                // for clarity in production reviews.
                const moveOptions: any = { from, to };
                if (promotion) {
                    moveOptions.promotion = promotion;
                }

                // If promotion is present it is passed through, otherwise this
                // behaves as a normal move with only from/to coordinates.
                const result = chess.move(moveOptions);
                const san = result.san;

                room?.moveHistory?.push({
                    san,
                    fen: chess.fen(),
                    by: player.color,
                });

                if (capturedPiece) {
                    const pieceNotation =
                        capturedPiece.color === "w"
                            ? capturedPiece.type.toUpperCase()
                            : capturedPiece.type.toLowerCase();
                    room?.capturedPieces.push(pieceNotation);
                }

                
                room?.players.forEach((p) => {
                    p.socket.emit("move-played", {
                        board: chess.fen(),
                        lastMove: { from, to },
                        turn: chess.turn(),
                        moveHistory: room.moveHistory,
                        promotion,
                        capturedPieces: room.capturedPieces,
                    });
                });

                logger.info(
                    {
                        roomId,
                        playerId,
                        san,
                        fen: chess.fen()
                    },
                    "Move applied"
                );

                if (this.isCheck(roomId)) {
                    socket.to(roomId).emit("check", {
                        message: "Check",
                    });
                    logger.info({ roomId }, "Check detected");
                }

                if (this.isDraw(roomId)) {
                    socket.to(roomId).emit("draw", {
                        message: "Match draw",
                    });
                    logger.info({ roomId }, "Match draw");
                }

                this.gameState(roomId, socket);

            } catch (error) {
                logger.warn(
                    { roomId, playerId, from, to, error },
                    "Invalid move attempted"
                );

                socket.emit("invalid-move", {
                    message: "Move is invalid",
                    from: from,
                    to: to
                })
            }
        })
    }

    public gameState(roomId: string, socket: Socket) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);

        if (chess?.isGameOver()) {
            if (chess.isCheckmate()) {
                const winner = chess.turn() === "w" ? "Black" : "White";

                logger.info({ roomId, winner }, "Game ended by checkmate");
                room?.players.forEach((p) => {
                    p.socket.emit("Game-over", {
                        winner, // Winner is opposite of current turn
                        message: "Checkmate",
                    });
                });
                this.endGame(roomId);
                return;
            }

            if (chess.isInsufficientMaterial() || chess.isStalemate()) {
                logger.info({ roomId }, "Draw detected");
                socket.to(roomId).emit("draw", {
                    message: "Match draw",
                });
                return;
            }
        }
    }

    private isCheck(roomId: string) {
        const chess = this.games.get(roomId);
        return chess?.isCheck();
    }

    private isDraw(roomId: string) {
        const chess = this.games.get(roomId);
        return chess?.isDraw();
    }

    public reconnectPlayer(socket: Socket, roomId: string, playerId: string) {
        logger.info(
            { roomId, playerId },
            "Player attempting reconnection",
        );

        const room = this.rooms.get(roomId);
        if (!room) {
            socket.emit("error", { message: "Room not found" });
            return;
        }

        const player = room.players.find((p) => p.id === playerId);
        if (!player) {
            socket.emit("error", {
                message: "Player not found",
            });
            return;
        }

        socket.join(roomId);
        player.socket = socket;

        const chess = this.games.get(roomId);

        if (!chess) {
            socket.emit("session-invalid", {
                message: "game-not-found",
            });
            logger.warn(
                { roomId, playerId },
                "Reconnect failed: game not found",
            );
            return;
        }

        socket.data.playerId = playerId;
        socket.data.roomId = roomId;
        socket.emit("session-valid");

        // Cancel disconnect timer if present for this player so that the
        // game is not incorrectly ended after a successful reconnection.
        if (room.disconnectTimer && room.disconnectedPlayerId === playerId) {
            clearTimeout(room.disconnectTimer);
            room.disconnectTimer = undefined;
            room.disconnectedPlayerId = undefined;

            logger.info(
                { roomId, playerId },
                "Player successfully reconnected, timer cleared",
            );

            // Notify the opponent that the player has reconnected.
            room.players.forEach((p) => {
                if (p.id !== playerId){
                    p.socket.emit("player-reconnected", {
                        message: "Opponent reconnected!",
                        reconnectedPlayer: player.color,
                    });
                }

            });
        }

        this.registerMove(roomId, socket, playerId);

        // Send entire game snapshot to the reconnecting player.
        socket.emit("reconnected-game", {
            board: chess.fen(),
            color: player.color,
            turn: chess.turn(),
            history: room.moveHistory,
            capturedPieces: room.capturedPieces,
        });
    }

    public handleDisconnect(_socket: Socket, playerId: string) {
        // Find the room containing this player so we can start a disconnect
        // timeout. This keeps the original behavior but makes the intent
        // explicit for maintainers.
        for (const [roomId, room] of this.rooms.entries()) {
            const player = room.players.find((p) => p.id === playerId);
            if (player) {
                logger.warn(
                    { roomId, playerId },
                    "Player disconnected, starting timeout",
                );

                // Start a timer only if a game is in progress and there are
                // two players; otherwise we just ignore the disconnect.
                const chess = this.games.get(roomId);
                if (!chess || room.players.length < 2) {
                    logger.warn({ roomId, playerId }, "Game not started");
                    continue;
                }

                // Notify the remaining player about the disconnect.
                room.players.forEach((p) => {
                    if (p.id !== playerId) {
                        p.socket.emit("player-disconnected", {
                            message: "Opponent disconnected",
                            disconnectedPlayer: player.color,
                            timeoutSeconds: 15,
                        });
                    }
                });

                // Clear any existing disconnect timer before starting a new one.
                if (room.disconnectTimer) {
                    clearTimeout(room.disconnectTimer);
                }

                room.disconnectedPlayerId = playerId;
                room.disconnectTimer = setTimeout(() => {
                    this.handleDisconnectTimeout(roomId, playerId);
                }, this.disconnectTimeoutMs);
            }
        }
    }

    private handleDisconnectTimeout(roomId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Check if the player is still part of this room before ending.
        const player = room.players.find((p) => p.id === playerId);
        if (!player) return;

        const winner = room.players.find((p) => p.id !== playerId);
        if (!winner) return;

        room.players.forEach((p) => {
            p.socket.emit("game-ended", {
                reason: "opponent-disconnected",
                winner: winner.color,
                message: `${player.color} player disconnected`,
            });
        });

        logger.info(
            { roomId, disconnectedPlayer: playerId, winner: winner.color },
            "Game ended due to disconnect timeout",
        );
        this.endGame(roomId);
    }

    public endGame(roomId: string) {
        logger.info({ roomId }, "Cleaning up game and room");
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (room.disconnectTimer) {
            clearTimeout(room.disconnectTimer);
        }

        room.players.forEach((p) => {
            p.socket.leave(roomId);
        });

        this.rooms.delete(roomId);
        this.games.delete(roomId);
    }
}
