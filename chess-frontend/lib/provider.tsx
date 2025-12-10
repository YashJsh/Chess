"use client"

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const { connectSocket, socket, connectionError, isConnecting } = useAuthStore();
    
    useEffect(() => {
        if (!socket) {
            connectSocket().catch((error) => {
                console.error("Socket connection error:", error);
            });
        }
    }, [socket, connectSocket]);

    return <>{children}</>;
}