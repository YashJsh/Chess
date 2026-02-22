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
gameHandler.setTimerEndCallback((roomId, winner) => {
    roomHandler.endGame(roomId);
});
roomHandler.setChessInstanceGetter((roomId) => gameHandler.getChess(roomId));
roomHandler.setGameRemover((roomId) => gameHandler.removeGame(roomId));
roomHandler.setTimerGetter((roomId) => gameHandler.getTimer(roomId));
roomHandler.setRegisterMoveCallback((roomId, socket, playerId, room) => {
    gameHandler.registerMoveForPlayer(roomId, socket, playerId, room);
});
export const init = (io) => {
    initRoomEvents(io, roomHandler, gameHandler);
};
//# sourceMappingURL=socket.js.map