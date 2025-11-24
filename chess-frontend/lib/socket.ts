
import { io , Socket} from "socket.io-client";

let socket : Socket | null = null;

export const getSocket = () =>{
    if (socket == null){
        socket = io("http://localhost:3001", {
            transports: ["websocket"],
            autoConnect: false, 
        });
    }
    return socket;
};
