import { GameManager } from "./game.js";
const game = new GameManager();
export const init = (io) => {
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("create-room", () => {
            game.createRoom(socket);
        });
        socket.on("join-room", ({ roomId }) => {
            game.joinRoom(socket, roomId);
        });
    });
};
//# sourceMappingURL=socket.js.map