import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface auth{
    baseUrl : string;
    socket : Socket | null,
    connectSocket : () => void,
    disconnectSocket : ()=> void,
    isSocketConnected : boolean,
}

export const useAuthStore = create<auth>((set, get)=>({
    baseUrl :  "ws://localhost:3001",
    socket : null,
    isSocketConnected : false,

    connectSocket : async ()=> {
        console.log("Connecting Socket");
        if (get().socket?.connected){
            console.log("Socket is already present, reusing :", get().socket?.id);
            return;
        }
        if (!get().socket?.connected && get().socket){
            console.log("Reconnecting existing socket");
            get().socket?.connect();
        }
        const baseUrl = get().baseUrl;
        const socketInstance = io(baseUrl, {
            transports : ["websocket", "polling"],
            reconnection : true,
            reconnectionAttempts : 5,
        }); 
        await socketInstance.connect();
        set({socket : socketInstance, isSocketConnected : true});
    },
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket?.disconnect();
    },


}))
