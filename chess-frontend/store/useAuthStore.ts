import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface auth{
    baseUrl : string;
    socket : Socket | null,
    connectSocket : () => void,
    disconnectSocket : ()=> void,
  
}

export const useAuthStore = create<auth>((set, get)=>({
    baseUrl :  "ws://localhost:3001",
    socket : null,


    connectSocket : ()=> {
        const socket = get().socket;
        const baseUrl = get().baseUrl;
        const socketInstance = io(baseUrl); 
        socketInstance.connect();
        set({socket : socketInstance});

    },
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket?.disconnect();
      },
  
}))
