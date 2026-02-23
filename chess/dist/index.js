import { Server } from "socket.io";
import express, { urlencoded } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./lib/logger.js";
import { init } from "./socket.js";
dotenv.config();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(cors({
    origin: CORS_ORIGIN === "*"
        ? "*"
        : CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
}));
// Lightweight health-check endpoint for uptime checks.
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timeStamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: "chess-game-server",
    });
});
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN === "*"
            ? "*"
            : CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    },
});
init(io);
httpServer.listen(PORT, () => {
    logger.info({
        port: PORT,
        cors: CORS_ORIGIN,
        env: process.env.NODE_ENV,
    }, "Server configuration loaded");
});
const shutdown = () => {
    logger.info("Shutting down server...");
    httpServer.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
};
//# sourceMappingURL=index.js.map