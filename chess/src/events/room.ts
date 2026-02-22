import type { Server } from "socket.io";
import { RoomHandler } from "../handlers/room.js";
import { GameHandler } from "../handlers/game.js";
import { logger } from "../lib/logger.js";

export const initRoomEvents = (io: Server, roomHandler: RoomHandler, gameHandler: GameHandler) => {
    io.on("connection", (socket) => {
        socket.on("create-room", () => {
            roomHandler.createRoom(socket);
        });

        socket.on("join-room", ({ roomId }: { roomId: string }) => {
            roomHandler.joinRoom(socket, roomId);
        });

        socket.on("player-ready", ({ playerId }: { playerId: string }) => {
            roomHandler.playerReady(socket, playerId);
        });

        socket.on(
            "reconnect-game",
            ({ roomId, playerId }: { roomId: string; playerId: string }) => {
                roomHandler.reconnectPlayer(socket, roomId, playerId);
            },
        );

        socket.on("disconnect", () => {
            const playerId = socket.data.playerId;
            if (!playerId) {
                logger.warn(
                    { socketId: socket.id },
                    "Disconnect before playerId assigned",
                );
                return;
            }

            logger.info({ playerId, socketId: socket.id }, "Player disconnected");
            roomHandler.handleDisconnect(socket);
        });
    });
};
