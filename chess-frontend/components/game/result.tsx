import { useGameStore } from "@/store/gameStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Handshake, RotateCcw, LayoutDashboard, Clock, Flag, WifiOff } from "lucide-react";
import { useState } from "react";

const getGameEndInfo = (gameStatus: string, gameEndReason: string | null, currentTurn: string | null) => {
    const winner = currentTurn === "w" ? "Black" : "White";
    const loser = currentTurn === "w" ? "White" : "Black";

    switch (gameStatus) {
        case "checkmate":
            return {
                icon: <Trophy size={32} />,
                iconBg: "bg-yellow-100 text-yellow-600",
                title: `${winner} Wins!`,
                description: `Checkmate - ${winner} wins by checkmate`,
            };
        case "timeout":
            return {
                icon: <Clock size={32} />,
                iconBg: "bg-orange-100 text-orange-600",
                title: `${winner} Wins!`,
                description: `Time run out! ${loser} ran out of time`,
            };
        case "resigned":
            return {
                icon: <Flag size={32} />,
                iconBg: "bg-red-100 text-red-600",
                title: `${winner} Wins!`,
                description: `${loser} resigned from the game`,
            };
        case "disconnected":
            return {
                icon: <WifiOff size={32} />,
                iconBg: "bg-gray-100 text-gray-600",
                title: `${winner} Wins!`,
                description: `${loser} disconnected from the game`,
            };
        case "draw":
            return {
                icon: <Handshake size={32} />,
                iconBg: "bg-gray-100 text-gray-600",
                title: "It's a Draw",
                description: "The game ended in a draw",
            };
        default:
            return {
                icon: <Trophy size={32} />,
                iconBg: "bg-yellow-100 text-yellow-600",
                title: "Game Over",
                description: "The game has ended",
            };
    }
};

export const Result = () => {
    const [modal, setModal] = useState(true);
    const router = useRouter();
    const { gameStatus, gameEndReason, currentTurn, resetGame } = useGameStore();

    const isGameOver = gameStatus === "draw" || gameStatus === "checkmate" || 
                       gameStatus === "timeout" || gameStatus === "resigned" || 
                       gameStatus === "disconnected";

    if (isGameOver) {
        localStorage.removeItem("playerId");
        localStorage.removeItem("roomId");
    }

    const goToDashboard = () => {
        localStorage.removeItem("playerId");
        localStorage.removeItem("roomId");
        resetGame();
        router.replace("/game");
        router.refresh();
    };

    const gameEndInfo = getGameEndInfo(gameStatus, gameEndReason, currentTurn);

    return (
        <>
            {isGameOver && (
                <Dialog open={modal}>
                    <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-8 [&>button]:hidden">
                        <DialogHeader className="flex flex-col items-center gap-3">
                            <div className={`p-4 rounded-full ${gameEndInfo.iconBg}`}>
                                {gameEndInfo.icon}
                            </div>
                            
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {gameEndInfo.title}
                            </DialogTitle>
                            
                            <DialogDescription className="text-base font-medium text-muted-foreground">
                                {gameEndInfo.description}
                            </DialogDescription>
                        </DialogHeader>
            
                        <div className="flex w-full gap-3 mt-6">
                            <Button 
                                className="flex-1 gap-2" 
                                variant="outline" 
                                onClick={() => {
                                    setModal(false);
                                }}
                            >
                                <RotateCcw className="w-4 h-4" />
                                Analysis
                            </Button>
                            <Button 
                                className="flex-1 gap-2" 
                                onClick={goToDashboard}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Button>
                        </div>
            
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
    