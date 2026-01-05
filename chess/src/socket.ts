import type { Server } from "socket.io";
import { GameManager } from "./game.js";
import { logger } from "./lib/logger.js";

const game = new GameManager();

export const init = (io: Server) => {
    io.on("connection", (socket) => {

        socket.on("create-room", () => {
            game.createRoom(socket);
        });

        socket.on("join-room", ({ roomId }: { roomId: string }) => {
            game.joinRoom(socket, roomId);
        });

        socket.on("player-ready", ({ playerId }: { playerId: string }) => {
            game.playerReady(socket, playerId);
        });

        socket.on(
            "reconnect-game",
            ({ roomId, playerId }: { roomId: string; playerId: string }) => {
                game.reconnectPlayer(socket, roomId, playerId);
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
            game.handleDisconnect(socket, playerId);
        });
    });
};
