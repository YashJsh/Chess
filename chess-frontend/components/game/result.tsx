import { useGameStore } from "@/store/gameStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Handshake, RotateCcw, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export const Result = () => {
    const [modal, setModal] = useState(true);
    const router = useRouter();
    const { gameStatus, currentTurn, resetGame } = useGameStore();
    if (gameStatus === "draw" || gameStatus === "checkmate") {
        localStorage.removeItem("playerId");
        localStorage.removeItem("roomId");
    };

    const goToDashboard = ()=>{
        localStorage.removeItem("playerId");
        localStorage.removeItem("roomId");
        resetGame();
        router.replace("/game");
        router.refresh();
    };

    return <>
        {
            (gameStatus === "draw" || gameStatus === "checkmate") && (
                <Dialog open={modal}>
                    <DialogContent className="sm:max-w-[425px] flex flex-col items-center text-center p-8 [&>button]:hidden">
                        {/* 1. Dynamic Header with Icon */}
                        <DialogHeader className="flex flex-col items-center gap-3">
                            <div className={`p-4 rounded-full ${gameStatus === "checkmate" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"}`}>
                                {gameStatus === "checkmate" ? <Trophy size={32} /> : <Handshake size={32} />}
                            </div>
                            
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {gameStatus === "checkmate" 
                                    ? (currentTurn === "w" ? "Black Wins!" : "White Wins!") 
                                    : "It's a Draw"}
                            </DialogTitle>
                            
                            <DialogDescription className="text-base font-medium text-muted-foreground">
                               {gameStatus === "checkmate" 
                                    ? `Checkmate by ${currentTurn === "w" ? "Black" : "White"}` 
                                    : "Neither player won this match."}
                            </DialogDescription>
                        </DialogHeader>
            
                        {/* 2. Action Buttons */}
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
}