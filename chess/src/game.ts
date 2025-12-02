import type { Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Chess } from "chess.js";

interface Player {
    id: string,
    socket: Socket,
    color: "White" | "Black"
}

interface Room {
    id: string;
    players: Player[];
    moveHistory: { from: string, to: string, fen: string, by: string }[];
}


export class GameManager {
    private rooms: Map<string, Room> = new Map();
    private games = new Map<string, Chess>();


    public createRoom(socket: Socket) {
        const roomId = uuidv4();
        socket.join(roomId);

        const player: Player = {
            id: socket.id,
            socket: socket,
            color: "White"
        }

        const room = {
            id: roomId,
            players: [player],
            moveHistory: []
        }

        this.rooms.set(roomId, room);

        socket.emit("room-created", {
            room: roomId,
            player_id: socket.id,
            message: "Room Created Successfully"
        });

        console.log("Room created:", roomId);
        console.log("and socket Id is : ", socket.id);
    };

    public joinRoom(socket: Socket, roomId: string) {
        console.log("Player_id is : ", socket.id);
        console.log("RoomID is : ", roomId);

        //Check if room exists;
        if (!this.rooms.has(roomId)) {
            socket.emit("error", {
                code: "ROOM_NOT_FOUND",
                message: `Room ${roomId} does not exist`
            });
            console.log("Room Doesn't exist");
            return;
        }

        if (this.rooms.get(roomId)!.players.length >= 2) {
            socket.emit("room-full", {
                msg: "Room is full"
            });
            console.log("Room FUll");
            return;
        }

        const player: Player = {
            id: socket.id,
            socket: socket,
            color: "Black"
        }

        const room = this.rooms.get(roomId)!;
        room.players.push(player);

        socket.emit("room-joined", {
            room: roomId,
            player_id: socket.id,
            message: "Room Joined Successfully"
        });
        this.game(roomId);
    };

    public game(roomId: string) {
        const chess = new Chess();
        this.games.set(roomId, chess);
        const room = this.rooms.get(roomId)!;

        room.players.forEach((p) => {
            p.socket.emit("game-started", {
                color: p.color,
                board: chess.fen(),
                message: "game is started",
                playertoMove: chess.turn()
            });
            this.registerMove(roomId, p.socket);
        });
        console.log("Game starting...... ");
    }

    private registerMove(roomId: string, socket: Socket) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);


        socket.on("move", ({ from, to }: { from: string, to: string }) => {
            console.log("from", from);
            console.log("to", to);
            // Check whose move is that'
            if (!chess || !this.rooms.get(roomId)) {
                socket.emit("game-not-started", {
                    players: room?.players.length,
                })
                console.log("Players on room", room?.players.length);
                return;
            };

            //Check for the particular player;
            const player = room?.players.find(p => p.id === socket.id);
            if (!player) {
                console.log("Player doesn't exist in this particular room");
                return;
            }

            const turn = chess.turn() === "w" ? "White" : "Black";
            if (turn != player.color) {
                console.log("This is not your chance, chance is of : ", turn);
                socket.emit("invalid-chance", {
                    message: "It is not your chance to move",
                    turn: chess.turn()
                })
                return;
            }

            try {
                chess.move({ from, to });

                console.log("Making Move now......")
                room?.players.forEach(p => {
                    p.socket.emit("move-played", {
                        board: chess.fen(),
                        lastMove: { from, to },
                        turn: chess.turn(),
                    });
                });

                room?.moveHistory?.push({
                    from: from,
                    to: to,
                    fen: chess.fen(),
                    by: player.color
                })

                console.log("..............");
                console.log(chess.fen());
                console.log(room?.moveHistory);

                if (this.isCheck(roomId)) {
                    socket.to(roomId).emit("check", {
                        message: "Check",
                    })
                    console.log("Check ongoing");
                };


                if (this.isDraw(roomId)) {
                    socket.to(roomId).emit("draw", {
                        message: "Match draw"
                    })
                    console.log("Match draw");
                };

                this.gameState(roomId, socket);

            } catch (error) {
                console.log("Invalid move attempted:", from, to);
                socket.emit("invalid-move", {
                    message: "Move is invalid",
                    from: from,
                    to: to
                })
            }
        })
    }

    public gameState(roomId: string, socket: Socket) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);
        console.log("Chess State ");
        console.log(chess?.fen());
        if (chess?.isGameOver()) {
            if (chess?.isCheckmate()) {
                console.log("Checkmate")
                room?.players.forEach(p => {
                    p.socket.emit("Game-over", {
                        winner: chess.turn() === "w" ? "Black" : "White", // Winner is opposite of current turn
                        message: "Checkmate"
                    });
                })
                return;
            } else if (chess?.isInsufficientMaterial() || chess?.isStalemate()) {
                console.log("Match draw");
                socket.to(roomId).emit("draw", {
                    message: "Match draw"
                })
                console.log("Match draw");
                return;
            }
        }

    }

    private isCheck(roomId: string) {
        const chess = this.games.get(roomId);
        return chess?.isCheck();
    }

    private isDraw(roomId: string) {
        const chess = this.games.get(roomId);
        return chess?.isDraw();
    }
}