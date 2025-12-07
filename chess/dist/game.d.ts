import type { Socket } from "socket.io";
export declare class GameManager {
    private rooms;
    private games;
    createRoom(socket: Socket): void;
    joinRoom(socket: Socket, roomId: string): void;
    playerReady(socket: Socket, playerId: string): void;
    game(roomId: string, playerId: string): void;
    private registerMove;
    gameState(roomId: string, socket: Socket): void;
    private isCheck;
    private isDraw;
    reconnectPlayer(socket: Socket, roomId: string, playerId: string): void;
}
//# sourceMappingURL=game.d.ts.map