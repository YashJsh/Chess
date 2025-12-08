"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from "../ui/button";


interface PromotionModalProps {
    isOpen: boolean;
    playerColor: "White" | "Black";
    onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

export const PromotionModal = ({ isOpen, playerColor, onSelect }: PromotionModalProps) => {
    const pieces = [
        { type: "q", name: "Queen", symbol: playerColor === "White" ? "♕" : "♛" },
        { type: "r", name: "Rook", symbol: playerColor === "White" ? "♖" : "♜" },
        { type: "b", name: "Bishop", symbol: playerColor === "White" ? "♗" : "♝" },
        { type: "n", name: "Knight", symbol: playerColor === "White" ? "♘" : "♞" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">
                        Choose Promotion
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Select which piece you want to promote your pawn to
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                    {pieces.map((piece) => (
                        <Button
                            key={piece.type}
                            onClick={() => onSelect(piece.type as "q" | "r" | "b" | "n")}
                            variant="outline"
                            className="h-24 text-6xl hover:bg-primary/10 hover:scale-105 transition-transform"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span>{piece.symbol}</span>
                                <span className="text-sm font-normal">{piece.name}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}