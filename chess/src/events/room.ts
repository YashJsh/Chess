import type { Server } from "socket.io";
import { logger } from "../lib/logger.js";

import { RoomHandler } from "../handlers/room.js";

//This is from where the socket events start.
export const initRoomEvents = (io: Server, roomHandler: RoomHandler) => {
    io.on("connection", (socket) => {
        socket.on("create-room", ({ timeControl }: { timeControl?: string } = {}) => {
            roomHandler.createRoom(socket, timeControl || "none");
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
