"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";


export const WaitingModal = ({roomId, showWaitingModal, setShowWaitingModal, } : {roomId : string, showWaitingModal : boolean, setShowWaitingModal : (value : boolean)=>void})=>{
    const [copied, setCopied] = useState(false);
    const { socket } = useAuthStore();
    const router = useRouter();

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId!);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(()=>{
        if (!socket) return;
        socket.on("game-started", () => {
            router.push(`/game/${roomId}`);
          });
    }, [socket])


    return (
    <Dialog open= {showWaitingModal} onOpenChange={setShowWaitingModal}>
            <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Waiting for Player
                        </DialogTitle>
                        <DialogDescription>
                            Share the room ID with your opponent. The game will start automatically when they join.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-sm text-muted-foreground mb-2">Room ID</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-2xl font-mono font-bold text-foreground">
                                    {roomId}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyRoomId}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Waiting for opponent to join...
                        </p>
                    </div>
                </DialogContent>
        </Dialog>
    )
}