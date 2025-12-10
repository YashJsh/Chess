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
        if (!socket) {
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
        
        console.log("Game ID : ", gameId);
        console.log("ROOM ID FROM STORAGE", savedRoomId);

        // If they have saved data but it doesn't match the URL
        if (savedRoomId && savedRoomId !== gameId) {
            toast.error("You don't have access to this game");
            setTimeout(() => router.push("/"), 1500);
            return;
        }

        // Try to reconnect if they have valid credentials
        if (savedRoomId === gameId && savedPlayerId) {
            console.log("🔐 Validating game access...");
            
            const handleReconnected = () => {
                console.log("✅ Game access validated");
                toast.success("Game session restored!");
                setIsValidating(false);
                setIsValid(true);
                socket.off("reconnected", handleReconnected);
                socket.off("error", handleError);
            };

            const handleError = (data: { message: string }) => {
                console.error("❌ Game validation failed:", data.message);
                toast.error(data.message || "Failed to validate game access");
                setTimeout(() => router.push("/"), 1500);
                setIsValidating(false);
                socket.off("reconnected", handleReconnected);
                socket.off("error", handleError);
            };

            socket.on("reconnected", handleReconnected);
            socket.on("error", handleError);

            return () => {
                socket.off("reconnected", handleReconnected);
                socket.off("error", handleError);
            };
        } else {
            // Valid scenario - user just joined/created room
            setIsValidating(false);
            setIsValid(true);
        }
    }, [socket, gameId, router, isValidating]);

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