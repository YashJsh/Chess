import { Server } from "socket.io";
import express, { urlencoded } from "express";
import { createServer } from "http"
import { init } from "./socket.js";


const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));
// Initialize Socket.IO with the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

init(io);

httpServer.listen(3001, () => {
    console.log("Server listening on port 3001");
});

