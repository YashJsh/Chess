import type { Socket } from "socket.io";
export declare class GameManager {
    private rooms;
    private games;
    createRoom(socket: Socket): void;
    joinRoom(socket: Socket, roomId: string): void;
    playerReady(socket: Socket): void;
    game(roomId: string): void;
    private registerMove;
    gameState(roomId: string, socket: Socket): void;
    private isCheck;
    private isDraw;
}
//# sourceMappingURL=game.d.ts.map