import { useGameStore } from "@/store/gameStore"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { User } from "lucide-react";
import { Button } from "../ui/button";

export const Result = () => {
    const { gameStatus, currentTurn } = useGameStore();
    return <>
        {
            gameStatus === "draw" && <div>
                <Dialog open={gameStatus === "draw"}>
                    <DialogContent className="sm:max-w-md space-y-4">
                        <DialogHeader className="flex justify-center items-center">
                            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                                <User className="h-5 w-5" />
                                Game Drawn
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                Neither player won — the game ends in a draw.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Buttons Section */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                            <Button className="w-full sm:w-auto" variant="default">
                                Dashboard
                            </Button>
                            <Button className="w-full sm:w-auto" variant="secondary">
                                Rematch
                            </Button>
                            <Button className="w-full sm:w-auto" variant="outline">
                                Analysis
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        }
        {
            gameStatus === "checkmate" && <div>
                <Dialog open={gameStatus === "checkmate"}>
                    <DialogContent className="sm:max-w-md space-y-4">
                        <DialogHeader className="flex justify-center items-center">
                            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                                <User className="h-5 w-5" />
                                {currentTurn == "w" ? (<h1>Game overflow</h1>) : (<h1>Game over</h1>)}
                                {gameStatus === "checkmate" && <h1>{`by ${gameStatus}`}</h1>}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-1">
                                {currentTurn == "w" ? (<h1>Black wins</h1>) : (<h1>White Wins</h1>)}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Buttons Section */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                            <Button className="w-full sm:w-auto" variant="default">
                                Dashboard
                            </Button>
                            <Button className="w-full sm:w-auto" variant="secondary">
                                Rematch
                            </Button>
                            <Button className="w-full sm:w-auto" variant="outline">
                                Analysis
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        }
    </>
}