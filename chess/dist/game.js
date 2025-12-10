import { v4 as uuidv4 } from "uuid";
import { Chess } from "chess.js";
import { uuid } from "uuidv4";
export class GameManager {
    rooms = new Map();
    games = new Map();
    createRoom(socket) {
        const roomId = uuidv4();
        socket.join(roomId);
        const player = {
            id: uuidv4(),
            socket: socket,
            color: "White"
        };
        const room = {
            id: roomId,
            players: [player],
            moveHistory: [],
            playerReadyCount: 0,
            capturedPieces: []
        };
        this.rooms.set(roomId, room);
        socket.emit("room-created", {
            room: roomId,
            player_id: player.id,
            message: "Room Created Successfully"
        });
        console.log("Room created:", roomId);
        console.log("and socket Id is : ", socket.id);
        console.log("Player Id is :", player.id);
    }
    ;
    joinRoom(socket, roomId) {
        console.log("RoomID is : ", roomId);
        //Check if room exists;
        if (!this.rooms.has(roomId)) {
            socket.emit("error-room", {
                code: "ROOM_NOT_FOUND",
                message: `Room ${roomId} does not exist`
            });
            console.log("Room Doesn't exist");
            return;
        }
        if (this.rooms.get(roomId).players.length >= 2) {
            socket.emit("room-full", {
                code: "room-full",
                message: "Room is full"
            });
            console.log("Room FUll");
            return;
        }
        const player = {
            id: uuidv4(),
            socket: socket,
            color: "Black"
        };
        const room = this.rooms.get(roomId);
        room.players.push(player);
        socket.emit("room-joined", {
            room: roomId,
            player_id: player.id,
            message: "Room Joined Successfully"
        });
    }
    ;
    playerReady(socket, playerId) {
        const room = this.rooms.values().find(r => r.players.some(p => p.id === playerId));
        if (!room) {
            console.log("Room is not present");
            return;
        }
        room.playerReadyCount++;
        console.log("Player ready with Id:", playerId, "Ready count:", room.playerReadyCount);
        if (room.playerReadyCount === 2) {
            console.log("Starting game now");
            this.game(room.id); // 👈 START THE GAME
        }
    }
    ;
    game(roomId) {
        const chess = new Chess();
        this.games.set(roomId, chess);
        const room = this.rooms.get(roomId);
        room.players.forEach((p) => {
            p.socket.emit("game-started", {
                color: p.color,
                board: chess.fen(),
                message: "game is started",
                playertoMove: chess.turn()
            });
            this.registerMove(roomId, p.socket, p.id);
        });
        console.log("Game starting...... ");
    }
    registerMove(roomId, socket, playerId) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);
        socket.on("move", ({ from, to, promotion }) => {
            console.log("from", from);
            console.log("to", to);
            // Check whose move is that'
            if (!chess || !this.rooms.get(roomId)) {
                socket.emit("game-not-started", {
                    players: room?.players.length,
                });
                console.log("Players on room", room?.players.length);
                return;
            }
            ;
            //Check for the particular player;
            const player = room?.players.find(p => p.id === playerId);
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
                });
                return;
            }
            try {
                const capturedPiece = chess.get(to);
                const piece = chess.get(from);
                const needPromotion = piece?.type === 'p' &&
                    ((piece.color === 'w' && to[1] === '8') ||
                        (piece.color === 'b' && to[1] === '1'));
                if (needPromotion && !promotion) {
                    socket.emit("promotion-required", ({
                        from,
                        to,
                        message: "Please select a piece for promotion"
                    }));
                    return;
                }
                ;
                // Here, type is any cause, we will add promotion conditionally.
                const moveOptions = { from, to };
                if (promotion) {
                    moveOptions.promotion = promotion;
                }
                //Here if promotion is there, then, we will add the promotion
                //Else the normal, from and to will be there in moveOptions
                const result = chess.move(moveOptions);
                const san = result.san;
                room?.moveHistory?.push({
                    san,
                    fen: chess.fen(),
                    by: player.color
                });
                if (capturedPiece) {
                    const pieceNotation = capturedPiece.color == "w"
                        ? capturedPiece.type.toUpperCase()
                        : capturedPiece.type.toLowerCase();
                    room?.capturedPieces.push(pieceNotation);
                }
                console.log("Making Move now......");
                room?.players.forEach(p => {
                    p.socket.emit("move-played", {
                        board: chess.fen(),
                        lastMove: { from, to },
                        turn: chess.turn(),
                        moveHistory: room.moveHistory,
                        promotion: promotion,
                        capturedPieces: room.capturedPieces
                    });
                });
                console.log("..............");
                console.log(chess.fen());
                console.log(room?.moveHistory);
                if (this.isCheck(roomId)) {
                    socket.to(roomId).emit("check", {
                        message: "Check",
                    });
                    console.log("Check ongoing");
                }
                ;
                if (this.isDraw(roomId)) {
                    socket.to(roomId).emit("draw", {
                        message: "Match draw"
                    });
                    console.log("Match draw");
                }
                ;
                this.gameState(roomId, socket);
            }
            catch (error) {
                console.log("Invalid move attempted:", from, to);
                socket.emit("invalid-move", {
                    message: "Move is invalid",
                    from: from,
                    to: to
                });
            }
        });
    }
    gameState(roomId, socket) {
        const chess = this.games.get(roomId);
        const room = this.rooms.get(roomId);
        console.log("Chess State ");
        console.log(chess?.fen());
        if (chess?.isGameOver()) {
            if (chess?.isCheckmate()) {
                console.log("Checkmate");
                room?.players.forEach(p => {
                    p.socket.emit("Game-over", {
                        winner: chess.turn() === "w" ? "Black" : "White", // Winner is opposite of current turn
                        message: "Checkmate"
                    });
                });
                return;
            }
            else if (chess?.isInsufficientMaterial() || chess?.isStalemate()) {
                console.log("Match draw");
                socket.to(roomId).emit("draw", {
                    message: "Match draw"
                });
                console.log("Match draw");
                return;
            }
        }
    }
    isCheck(roomId) {
        const chess = this.games.get(roomId);
        return chess?.isCheck();
    }
    isDraw(roomId) {
        const chess = this.games.get(roomId);
        return chess?.isDraw();
    }
    reconnectPlayer(socket, roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            socket.emit("error", { message: "Room not found" });
            return;
        }
        const player = room.players.find(p => p.id === playerId);
        if (!player) {
            socket.emit("error", {
                message: "Player not found"
            });
            return;
        }
        socket.join(roomId);
        player.socket = socket;
        const chess = this.games.get(roomId);
        if (!chess) {
            socket.emit("game-not-found", {
                message: "game not found"
            });
            console.log("Game is not present");
            return;
        }
        console.log("🔁 Player reconnected:", playerId);
        this.registerMove(roomId, socket, playerId);
        // send entire game snapshot
        socket.emit("reconnected", {
            board: chess.fen(),
            color: player?.color,
            turn: chess.turn(),
            history: room.moveHistory,
            capturedPieces: room.capturedPieces,
            message: "Reconnected successfully"
        });
    }
}
//# sourceMappingURL=game.js.map