"use client"

import { useGameStore } from "@/store/gameStore"
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef, useState } from "react"

export const useGameConnect = () => {
    const { initializeGameListeners, cleanUpListeners, roomId } = useGameStore();
    const { socket, isSocketConnected } = useAuthStore();
    const [listenersReady, setListeners] = useState(false);


    useEffect(() => {
        console.log("Initializing Game Listeners");
        console.log("Socket ID is : ", socket?.id)
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

        const savedPlayer = localStorage.getItem("playerId");
        console.log("🔥 Emitting player-ready for ", socket.id);
        socket.emit("player-ready", {playerId : savedPlayer});
    }, [socket, roomId, listenersReady]);

    useEffect(() => {
        if (!socket || !isSocketConnected) return;
    
        const savedRoom = localStorage.getItem("roomId");
        const savedPlayer = localStorage.getItem("playerId");
        console.log("Socket is present", socket.id);

        if (savedRoom && savedPlayer) {
            console.log("🔁 Attempting reconnect...");
            socket.emit("reconnect-game", {
                roomId: savedRoom,
                playerId: savedPlayer
            });

        }

    }, [socket, isSocketConnected])

};