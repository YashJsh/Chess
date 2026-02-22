import type { Socket } from "socket.io";
import { Chess, type Square } from "chess.js";
import type { Room } from "../types/index.js";
import { logger } from "../lib/logger.js";

export class GameHandler {
    private readonly games: Map<string, Chess> = new Map();
    private getRoom: ((roomId: string) => Room | undefined) | null = null;
    private endGame: ((roomId: string) => void) | null = null;

    public setRoomGetter(callback: (roomId: string) => Room | undefined) {
        this.getRoom = callback;
    }

    public setEndGameCallback(callback: (roomId: string) => void) {
        this.endGame = callback;
    }

    public startGame(roomId: string, room: Room) {
        const chess = new Chess();
        this.games.set(roomId, chess);

        room.players.forEach((p) => {
            p.socket.emit("game-started", {
                color: p.color,
                board: chess.fen(),
                message: "game is started",
                playertoMove: chess.turn(),
            });

            this.registerMove(roomId, p.socket, p.id, room);
        });
        logger.info({ roomId }, "Game started");
    }

    private registerMove(roomId: string, socket: Socket, playerId: string, room: Room) {
        const chess = this.games.get(roomId);

        socket.on(
            "move",
            ({ from, to, promotion }: { from: string; to: string; promotion?: string }) => {
                logger.debug(
                    { roomId, playerId, from, to, promotion },
                    "Move received",
                );

                if (!chess || !this.getRoom) {
                    socket.emit("game-not-started", {
                        players: room?.players.length,
                    });
                    logger.warn("Game not started");
                    return;
                }

                const currentRoom = this.getRoom(roomId);
                if (!currentRoom) {
                    logger.warn({ roomId }, "Room not found");
                    return;
                }

                const player = currentRoom.players.find((p) => p.id === playerId);
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
                    });
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

                    const moveOptions: any = { from, to };
                    if (promotion) {
                        moveOptions.promotion = promotion;
                    }

                    const result = chess.move(moveOptions);
                    const san = result.san;

                    currentRoom.moveHistory?.push({
                        san,
                        fen: chess.fen(),
                        by: player.color,
                    });

                    if (capturedPiece) {
                        const pieceNotation =
                            capturedPiece.color === "w"
                                ? capturedPiece.type.toUpperCase()
                                : capturedPiece.type.toLowerCase();
                        currentRoom.capturedPieces.push(pieceNotation);
                    }

                    currentRoom.players.forEach((p) => {
                        p.socket.emit("move-played", {
                            board: chess.fen(),
                            lastMove: { from, to },
                            turn: chess.turn(),
                            moveHistory: currentRoom.moveHistory,
                            promotion,
                            capturedPieces: currentRoom.capturedPieces,
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

                    if (this.isCheck(roomId, chess)) {
                        socket.to(roomId).emit("check", {
                            message: "Check",
                        });
                        logger.info({ roomId }, "Check detected");
                    }

                    if (this.isDraw(roomId, chess)) {
                        socket.to(roomId).emit("draw", {
                            message: "Match draw",
                        });
                        logger.info({ roomId }, "Match draw");
                    }

                    this.gameState(roomId, socket, chess);

                } catch (error) {
                    logger.warn(
                        { roomId, playerId, from, to, error },
                        "Invalid move attempted"
                    );

                    socket.emit("invalid-move", {
                        message: "Move is invalid",
                        from: from,
                        to: to
                    });
                }
            }
        );
    }

    public gameState(roomId: string, socket: Socket, chess?: Chess) {
        const gameChess = chess || this.games.get(roomId);
        const room = this.getRoom ? this.getRoom(roomId) : undefined;

        if (gameChess?.isGameOver()) {
            if (gameChess.isCheckmate()) {
                const winner = gameChess.turn() === "w" ? "Black" : "White";

                logger.info({ roomId, winner }, "Game ended by checkmate");
                room?.players.forEach((p) => {
                    p.socket.emit("Game-over", {
                        winner,
                        message: "Checkmate",
                    });
                });
                if (this.endGame) {
                    this.endGame(roomId);
                }
                return;
            }

            if (gameChess.isInsufficientMaterial() || gameChess.isStalemate()) {
                logger.info({ roomId }, "Draw detected");
                socket.to(roomId).emit("draw", {
                    message: "Match draw",
                });
                return;
            }
        }
    }

    public isCheck(roomId: string, chess?: Chess): boolean {
        const gameChess = chess || this.games.get(roomId);
        return gameChess?.isCheck() ?? false;
    }

    public isDraw(roomId: string, chess?: Chess): boolean {
        const gameChess = chess || this.games.get(roomId);
        return gameChess?.isDraw() ?? false;
    }

    public getChess(roomId: string): Chess | undefined {
        return this.games.get(roomId);
    }

    public removeGame(roomId: string) {
        this.games.delete(roomId);
    }
}
