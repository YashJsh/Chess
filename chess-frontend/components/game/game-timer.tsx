"use client"

import { useGameStore } from "@/store/gameStore"

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const GameTimer = () => {
    const { timer, timeControl, playerColor, currentTurn } = useGameStore();

    if (timeControl === "none" || !timer) {
        return null;
    }

    const whiteTime = timer.white;
    const blackTime = timer.black;

    const isWhiteTurn = currentTurn === "w";
    const isBlackTurn = currentTurn === "b";

    return (
        <div className="flex items-center justify-center gap-4 py-2">
            <div className={`flex flex-col items-center p-3 rounded-lg border-2 ${isWhiteTurn ? 'bg-primary/10 border-primary' : 'bg-muted border-transparent'}`}>
                <span className="text-xs font-medium text-muted-foreground">White</span>
                <span className={`text-2xl font-bold font-mono ${whiteTime <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                    {formatTime(whiteTime)}
                </span>
            </div>

            <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-muted-foreground">VS</span>
            </div>

            <div className={`flex flex-col items-center p-3 rounded-lg border-2 ${isBlackTurn ? 'bg-primary/10 border-primary' : 'bg-muted border-transparent'}`}>
                <span className="text-xs font-medium text-muted-foreground">Black</span>
                <span className={`text-2xl font-bold font-mono ${blackTime <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                    {formatTime(blackTime)}
                </span>
            </div>
        </div>
    );
}
