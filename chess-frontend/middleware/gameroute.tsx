"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GameRouteGuard({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const { socket } = useAuthStore();
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);

    const gameId = params.roomId as string;

    useEffect(() => {
        if (!socket || !gameId) {
            setIsValidating(true);
            return;
        }
        // Check if user has access to this room
        const savedRoomId = localStorage.getItem("roomId");
        const savedPlayerId = localStorage.getItem("playerId");
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if (!uuidRegex.test(gameId)) {
            toast.error("Invalid game ID format");
            setTimeout(() => router.push("/"), 1500);
            return;
        }

        //For fresh game : 
        if (!savedPlayerId || !savedRoomId){
            setIsValid(true);
            setIsValidating(false);
            return;
        }

        const onValid = ()=>{
            console.log("Valid session");
            setIsValid(true);
            setIsValidating(false);
            cleanup();
        }

        const onInvalid = (data : {message : string})=>{
            console.log("Invalid-session");
            toast.error(data.message);
            setIsValidating(false);
            setIsValid(false);
            router.replace("/game");
            cleanup();
        }

        socket.on("session-valid", onValid);
        socket.on("session-invalid", onInvalid);

        socket.emit("reconnect-game", {
            playerId : savedPlayerId,
            roomId : savedRoomId
        });

        const cleanup = () => {
            socket.off("session-valid", onValid);
            socket.off("session-invalid", onInvalid);
        };
        return cleanup;
    }, [socket, gameId, router]);

    // Loading state
    if (isValidating) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">Validating Access</h2>
                        <p className="text-muted-foreground">
                            Please wait while we verify your game session...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Valid access - render the game
    if (isValid) {
        return <>{children}</>;
    }

    // Fallback loading (during redirect)
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}