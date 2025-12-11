import type { Socket } from "socket.io";
export declare class GameManager {
    private rooms;
    private games;
    private Disconnect_TIMEOUT;
    createRoom(socket: Socket): void;
    joinRoom(socket: Socket, roomId: string): void;
    playerReady(socket: Socket, playerId: string): void;
    game(roomId: string): void;
    private registerMove;
    gameState(roomId: string, socket: Socket): void;
    private isCheck;
    private isDraw;
    reconnectPlayer(socket: Socket, roomId: string, playerId: string): void;
    handleDisconnect(socket: Socket, playerId: string): void;
    private handleDisconnectTimeout;
    endGame(roomId: string): void;
}
//# sourceMappingURL=game.d.ts.map