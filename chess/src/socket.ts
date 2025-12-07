import type { Server } from "socket.io";
import { GameManager } from "./game.js";

const game = new GameManager();

export const init = (io : Server)=>{
    io.on("connection", (socket) => {
        console.log(socket.id);
        socket.on("create-room", ()=>{
            game.createRoom(socket);
        });

        socket.on("join-room", ({roomId} : {roomId : string})=>{
            console.log("roomid is : ", roomId);
            game.joinRoom(socket, roomId);
        }); 

        socket.on("player-ready", ({playerId} : {playerId : string})=>{
            console.log("playerReady : ", socket.id);
            game.playerReady(socket, playerId);
        });

        socket.on("reconnect-game", ({roomId, playerId}  : {roomId : string, playerId : string})=>{
            game.reconnectPlayer(socket, roomId, playerId);
        })

        socket.on("disconnect", ()=>{
            io.emit("Player disconnected", ()=>{
                playerId : socket.id
            })
        });
    });
}



