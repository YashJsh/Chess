import { GameManager } from "./game.js";
const game = new GameManager();
export const init = (io) => {
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("create-room", () => {
            game.createRoom(socket);
        });
        socket.on("join-room", ({ roomId }) => {
            console.log("roomid is : ", roomId);
            game.joinRoom(socket, roomId);
        });
        socket.on("player-ready", () => {
            console.log("playerReady : ", socket.id);
            game.playerReady(socket);
        });
        socket.on("disconnect", () => {
            io.emit("Player disconnected", () => {
                playerId: socket.id;
            });
        });
    });
};
//# sourceMappingURL=socket.js.map