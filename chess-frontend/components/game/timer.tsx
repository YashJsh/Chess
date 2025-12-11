"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { WifiOff, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface DisconnectTimerProps {
    isOpen: boolean;
    disconnectedPlayer: "White" | "Black";
    initialSeconds: number;
};

export const DisconnectTimer = ({ 
    isOpen, 
    disconnectedPlayer, 
    initialSeconds 
}: DisconnectTimerProps) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    useEffect(() => {
        if (!isOpen) {
            setSecondsLeft(initialSeconds);
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, initialSeconds]);

    // Calculate progress percentage
    const progress = (secondsLeft / initialSeconds) * 100;
    
    // Color changes based on time left
    const getColor = () => {
        if (secondsLeft <= 5) return "text-red-500";
        if (secondsLeft <= 10) return "text-orange-500";
        return "text-primary";
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-center justify-center">
                        <WifiOff className="h-5 w-5 text-destructive" />
                        Player Disconnected
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {disconnectedPlayer} player has disconnected. 
                        Waiting for reconnection...
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center space-y-6 placeholder-yellow-50-4">
                    {/* Circular Progress */}
                    <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-34 h-34 ">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                                className={`${getColor()} transition-all duration-1000`}
                                strokeLinecap="round"
                            />
                        </svg>
                        
                        {/* Timer Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${getColor()}`}>
                                    {secondsLeft}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    seconds
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    {secondsLeft <= 5 && (
                        <p className="text-sm text-destructive animate-pulse">
                            Game will end in {secondsLeft} seconds!
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}