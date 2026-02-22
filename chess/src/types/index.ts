import type { Socket } from "socket.io";

export interface Player {
    id: string;
    socket: Socket;
    color: "White" | "Black";
}

export interface Room {
    id: string;
    players: Player[];
    moveHistory: { san: string; fen: string; by: string }[];
    playerReadyCount: number;
    capturedPieces: string[];
    disconnectTimer?: NodeJS.Timeout;
    disconnectedPlayerId?: string;
}

export interface Timer{
    white : number,
    black : number,
    increment : number,
    isRunning : boolean
}
