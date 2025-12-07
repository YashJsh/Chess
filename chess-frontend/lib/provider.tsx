"use client"

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const { connectSocket, socket } = useAuthStore();
    
    useEffect(() => {
        if (!socket) {
            connectSocket();
        }
    }, []);

    return <>{children}</>;
}