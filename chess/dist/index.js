import { Server } from "socket.io";
import express, { urlencoded } from "express";
import { createServer } from "http";
import { init } from "./socket.js";
import dotenv from "dotenv";
import { logger } from "./lib/logger.js";
import cors from "cors";
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
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));
// Lightweight health-check endpoint for uptime checks and load balancers.
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
// Centralised graceful-shutdown handler to ensure the HTTP server
// is closed cleanly in production deployments (e.g. Kubernetes).
const shutdown = () => {
    logger.info("Shutting down server...");
    httpServer.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught exception");
    process.exit(1);
});
//# sourceMappingURL=index.js.map