"use client"

import { useGameStore } from "@/store/gameStore"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react"

export const useGameConnect = () => {
    const { initializeGameListeners, cleanUpListeners, roomId} = useGameStore();
    const { socket } = useAuthStore();
    const [listenersReady, setListeners] = useState(false);

    console.log("Under Game Connect");

    useEffect(() => {
        console.log("Initializing Game Listeners");
        console.log("Socket Id is : ",socket?.id);
        if (socket) {
            initializeGameListeners();
            setListeners(true);
        }
        return () => {
            cleanUpListeners();
        }
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        if (!roomId) return;
        if (!listenersReady) return;
    
        console.log("🔥 Emitting player-ready for ", socket.id);
        socket.emit("player-ready");
    }, [socket, roomId, listenersReady]);
};