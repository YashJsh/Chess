import type { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { Player, Room } from "../types/index.js";
import { logger } from "../lib/logger.js";

export class RoomHandler {
    private readonly rooms: Map<string, Room> = new Map();
    private readonly disconnectTimeoutMs = 15000; //By default 15 seconds.
    //Callback for starting the game.
    private onGameStart: ((roomId: string) => void) | null = null;
    private getChessInstanceFn: ((roomId: string) => any) | null = null;
    private removeGame: ((roomId: string) => void) | null = null;
    private getTimerFn: ((roomId: string) => { white: number; black: number } | null) | null = null;
    private registerMoveCallback: ((roomId: string, socket: Socket, playerId: string, room: Room) => void) | null = null;

    public setGameStartCallback(callback: (roomId: string) => void) {
        this.onGameStart = callback;
    }

    public setChessInstanceGetter(callback: (roomId: string) => any) {
        this.getChessInstanceFn = callback;
    }

    public setGameRemover(callback: (roomId: string) => void) {
        this.removeGame = callback;
    }

    public setTimerGetter(callback: (roomId: string) => { white: number; black: number } | null) {
        this.getTimerFn = callback;
    }

    public setRegisterMoveCallback(callback: (roomId: string, socket: Socket, playerId: string, room: Room) => void) {
        this.registerMoveCallback = callback;
    }

    //Create room
    public createRoom(socket: Socket, timeControl: string = "none") {
        const roomId = uuidv4();
        socket.join(roomId);

        const player: Player = {
            id: uuidv4(),
            socket,
            color: "White",
        };
        //Adding the player to the room.
        const room: Room = {
            id: roomId,
            players: [player],
            moveHistory: [],
            playerReadyCount: 0,
            capturedPieces: [],
            timeControl,
        };

        this.rooms.set(roomId, room);

        socket.data.playerId = player.id;
        socket.data.roomId = room.id;

        socket.emit("room-created", {
            room: roomId,
            player_id: player.id,
            message: "Room Created Successfully",
            timeControl: timeControl,
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

        //Check if room exists;
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


    //After joining or creating, each player sends i am ready flag. Which the increments player ready count.
    //If both players are ready, then game starts.
    public playerReady(socket: Socket, playerId: string) {
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
            if (this.onGameStart) {
                this.onGameStart(room.id);
            }
        }
    }

    public handleDisconnect(socket: Socket) {
        const playerId = socket.data.playerId;
        if (!playerId) {
            logger.warn(
                { socketId: socket.id },
                "Disconnect before playerId assigned",
            );
            return;
        }

        logger.info({ playerId, socketId: socket.id }, "Player disconnected");

        for (const [roomId, room] of this.rooms.entries()) {
            const player = room.players.find((p) => p.id === playerId);
            if (player) {
                logger.warn(
                    { roomId, playerId },
                    "Player disconnected, starting timeout",
                );
                //This gets the current running chess instance. // To check if game started or not.
                const chess = this.getChessInstance(roomId);
                if (!chess || room.players.length < 2) {
                    logger.warn({ roomId, playerId }, "Game not started");
                    continue;
                }

                room.players.forEach((p) => {
                    if (p.id !== playerId) {
                        p.socket.emit("player-disconnected", {
                            message: "Opponent disconnected",
                            disconnectedPlayer: player.color,
                            timeoutSeconds: 15,
                        });
                    }
                });

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

    //Dissconnect function : If player doensn't come back before 15 seconds.
    private handleDisconnectTimeout(roomId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

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

    //If player comes back, we have to reconnect the player.
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
        //Add the new socket to the player
        player.socket = socket;

        // Registering the move handler again for the new socket.
        const currentRoom = this.rooms.get(roomId);
        if (currentRoom && this.registerMoveCallback) {
            this.registerMoveCallback(roomId, socket, playerId, currentRoom);
        }

        const chess = this.getChessInstance(roomId);

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

        if (room.disconnectTimer && room.disconnectedPlayerId === playerId) {
            clearTimeout(room.disconnectTimer);
            delete room.disconnectTimer;
            delete room.disconnectedPlayerId;

            logger.info(
                { roomId, playerId },
                "Player successfully reconnected, timer cleared",
            );

            room.players.forEach((p) => {
                if (p.id !== playerId) {
                    p.socket.emit("player-reconnected", {
                        message: "Opponent reconnected!",
                        reconnectedPlayer: player.color,
                    });
                }
            });
        }

        //Game reconnected.
        socket.emit("reconnected-game", {
            board: chess.fen(),
            color: player.color,
            turn: chess.turn(),
            history: room.moveHistory,
            capturedPieces: room.capturedPieces,
            timeControl: room.timeControl,
            timer: this.getTimer(roomId),
        });

        // Also send full state to the other player so they stay in sync
        room.players.forEach((p) => {
            if (p.id !== playerId) {
                p.socket.emit("reconnected-game", {
                    board: chess.fen(),
                    color: p.color,
                    turn: chess.turn(),
                    history: room.moveHistory,
                    capturedPieces: room.capturedPieces,
                    timeControl: room.timeControl,
                    timer: this.getTimer(roomId),
                });
            }
        });
    }

    //End game: This function cleansup game and room.
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
        this.removeChessInstance(roomId);
    }

    public getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    public getAllRooms(): Map<string, Room> {
        return this.rooms;
    }

    protected getChessInstance(roomId: string): any {
        if (this.getChessInstanceFn) {
            return this.getChessInstanceFn(roomId);
        }
        return undefined;
    }

    protected removeChessInstance(roomId: string): void {
        if (this.removeGame) {
            this.removeGame(roomId);
        }
    }

    public getTimer(roomId: string): { white: number; black: number } | null {
        if (this.getTimerFn) {
            return this.getTimerFn(roomId);
        }
        return null;
    }
}
