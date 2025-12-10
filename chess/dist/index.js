import { Server } from "socket.io";
import express, { urlencoded } from "express";
import { createServer } from "http";
import { init } from "./socket.js";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timeStamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: "chess-game-server"
    });
});
// Get environment variables with defaults
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
// Initialize Socket.IO with the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN === "*" ? "*" : CORS_ORIGIN.split(",").map(origin => origin.trim())
    }
});
init(io);
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`CORS origin: ${CORS_ORIGIN}`);
});
//# sourceMappingURL=index.js.map