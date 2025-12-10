import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { toast } from "sonner";

interface auth{
    baseUrl : string;
    socket : Socket | null,
    connectSocket : () => Promise<void>,
    disconnectSocket : ()=> void,
    isSocketConnected : boolean,
    connectionError : string | null,
    isConnecting : boolean,
}

export const useAuthStore = create<auth>((set, get)=>({
    baseUrl :  process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001",
    socket : null,
    isSocketConnected : false,
    connectionError : null,
    isConnecting : false,

    connectSocket : async ()=> {
        // If already connected, return early
        if (get().socket?.connected){
            return;
        }

        // If socket exists but not connected, try to reconnect
        const existingSocket = get().socket;
        if (existingSocket && !existingSocket.connected){
            try {
                set({ isConnecting: true, connectionError: null });
                existingSocket.connect();
                return;
            } catch (error) {
                set({ 
                    isConnecting: false, 
                    connectionError: "Failed to reconnect socket",
                    isSocketConnected: false 
                });
                throw error;
            }
        }

        // Create new socket connection
        set({ isConnecting: true, connectionError: null });
        
        const baseUrl = get().baseUrl;
        
        try {
            const socketInstance = io(baseUrl, {
                transports : ["websocket", "polling"],
                reconnection : true,
                reconnectionAttempts : 5,
                reconnectionDelay : 1000,
                reconnectionDelayMax : 5000,
                timeout : 20000,
            });

            // Set up error handlers before connecting
            socketInstance.on("connect", () => {
                set({ 
                    socket: socketInstance, 
                    isSocketConnected: true,
                    isConnecting: false,
                    connectionError: null 
                });
            });

            socketInstance.on("connect_error", (error) => {
                const errorMessage = error.message || "Failed to connect to server";
                set({ 
                    isSocketConnected: false,
                    isConnecting: false,
                    connectionError: errorMessage 
                });
                toast.error("Connection Error", {
                    description: errorMessage,
                });
            });

            socketInstance.on("disconnect", (reason) => {
                set({ 
                    isSocketConnected: false,
                    connectionError: reason === "io server disconnect" 
                        ? "Server disconnected" 
                        : "Connection lost"
                });
                
                if (reason === "io server disconnect") {
                    toast.error("Disconnected", {
                        description: "Server closed the connection",
                    });
                } else if (reason === "transport close" || reason === "transport error") {
                    toast.warning("Connection Lost", {
                        description: "Attempting to reconnect...",
                    });
                }
            });

            socketInstance.on("reconnect_attempt", (attemptNumber) => {
                if (attemptNumber === 1) {
                    toast.info("Reconnecting...", {
                        description: "Attempting to restore connection",
                    });
                }
            });

            socketInstance.on("reconnect_failed", () => {
                const errorMessage = "Failed to reconnect after multiple attempts";
                set({ 
                    isSocketConnected: false,
                    isConnecting: false,
                    connectionError: errorMessage 
                });
                toast.error("Reconnection Failed", {
                    description: "Please refresh the page to try again",
                    action: {
                        label: "Refresh",
                        onClick: () => window.location.reload(),
                    },
                });
            });

            socketInstance.on("reconnect", (attemptNumber) => {
                set({ 
                    isSocketConnected: true,
                    connectionError: null 
                });
                toast.success("Reconnected", {
                    description: `Connection restored after ${attemptNumber} attempt(s)`,
                });
            });

            // Attempt connection with timeout
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    socketInstance.disconnect();
                    reject(new Error("Connection timeout. Please check if the server is running."));
                }, 20000);

                socketInstance.once("connect", () => {
                    clearTimeout(timeout);
                    resolve();
                });

                socketInstance.once("connect_error", (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });

                socketInstance.connect();
            });

        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Failed to establish connection";
            
            set({ 
                socket: null,
                isSocketConnected: false,
                isConnecting: false,
                connectionError: errorMessage 
            });

            toast.error("Connection Failed", {
                description: errorMessage,
            });

            throw error;
        }
    },
    
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            set({ 
                isSocketConnected: false,
                connectionError: null 
            });
        }
    },
}))

