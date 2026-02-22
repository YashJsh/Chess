import type { Server } from "socket.io";
import { RoomHandler } from "./handlers/room.js";
import { GameHandler } from "./handlers/game.js";
import { initRoomEvents } from "./events/room.js";


const roomHandler = new RoomHandler();
const gameHandler = new GameHandler();

roomHandler.setGameStartCallback((roomId) => {
    const room = roomHandler.getRoom(roomId);
    if (room) {
        gameHandler.startGame(roomId, room);
    }
});

gameHandler.setRoomGetter((roomId) => roomHandler.getRoom(roomId));
gameHandler.setEndGameCallback((roomId) => roomHandler.endGame(roomId));

roomHandler.setChessInstanceGetter((roomId) => gameHandler.getChess(roomId));
roomHandler.setGameRemover((roomId) => gameHandler.removeGame(roomId));

export const init = (io: Server) => {
    initRoomEvents(io, roomHandler, gameHandler);
};
