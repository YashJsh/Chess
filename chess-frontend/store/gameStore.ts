import { create } from "zustand";
import { Chess, Square } from "chess.js";
import { Piece } from "@/components/game/square";
import { useAuthStore } from "./useAuthStore";
import { game_started, invalid_chance, invalid_move, move_played, room_response } from "@/types/game";

interface GameState {
    chess : Chess,
    board : ReturnType<Chess['board']> | null,
    capturedPieces : Piece[],

    playerColor: "White" | "Black" | null;
    currentTurn : "w" | "b" | null;

    selected : string | null,
    setSelected : (sq : string | null) => void;
    resetSelected : () => void;

    legalMoves : string[];
    setLegalMoves : (moves : string[]) => void;
    history : string[],


    setHistory : (moves : string[]) => void;

    setBoard : () => void;
    makeMove : (from : string, to : string) => boolean;

    joinRoom : (roomId : string)=> void;
    createRoom : () => void;

    roomId : string | null;
    playerId : string | null;
    gameStatus: "waiting" | "playing" | "checkmate" | "draw" | "check";

    initializeGameListeners : ()=> void;
    cleanUpListeners : () => void;
}

export const useGameStore = create<GameState>((set, get)=>({
    chess : new Chess(),
    board : null,
    selected : null,
    toSelectedSquare : null,
    toSquare : null,
    legalMoves: [],
    history : [],
    capturedPieces : [],
    roomId : null,
    playerId : null,
    playerColor : "White",
    currentTurn : null,
    gameStatus : "waiting",


    createRoom : () => {
        const socket = useAuthStore.getState().socket;
        if(socket === null) return;
        socket.emit("create-room");
    },

    joinRoom : (roomId : string)=>{
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.emit("join-room", {roomId});
    },

    initializeGameListeners : ()=>{
        const socket = useAuthStore.getState().socket;

        if (!socket) {
            console.log("Socket is not present");
            return;
        };
        
        console.log("✅ Initializing game listeners on socket:", socket.id);

        socket.on("room-created", (data : room_response)=>{
            console.log("ROOM CREATED RESPONSE");
            set({roomId : data.room, playerId : data.player_id})
            console.log(data.message);
        });

        socket.on("room-joined", (data : room_response) => {
            set({roomId : data.room, playerId : data.player_id});
            console.log(data.message);
        });


        //Game started : 
        socket.on("game-started", (data : game_started)=>{
            console.log("Game-started event");
            const chess = new Chess(data.board);
            set({
                chess,
                board : chess.board(),
                playerColor : data.color,
                currentTurn : data.playertoMove as "w" | "b",
                gameStatus : "playing",
                history : chess.history(),
            })
            console.log("Game started : You are : ",data.color);
        });

        socket.on("move-played", (data : move_played)=>{
            const newChess = new Chess(data.board);
            const capturedPieces = get().capturedPieces;

            const oldChess = get().chess;
            const captured = oldChess.get(data.lastMove.to as Square);
            let newCapturedPieces = [...capturedPieces]

            if (captured) {
                const pieceNotation = captured.color === "w"
                    ? captured.type.toUpperCase()
                    : captured.type.toLowerCase();
                newCapturedPieces.push(pieceNotation as Piece);
            }

            set({
                chess : newChess,
                board : newChess.board(),
                currentTurn : data.turn as "w" | "b",
                selected : null,
                legalMoves : [],
                history : newChess.history(),
                capturedPieces : newCapturedPieces,
                gameStatus : newChess.isCheck() ? "check" : "playing"
            });
        });

        socket.on("invalid-move", (data : invalid_move)=>{
            console.warn("Server Rejected move : ", data.message);
            set({
                selected : null,
                legalMoves : []
            })
        });

        socket.on("invalid-chance", (data : invalid_chance)=>{
            console.warn(data.message);
            set({
                selected : null,
                legalMoves : []
            })
        });

        socket.on("check", (data : {message : string}) =>{
            set({gameStatus : "check"})
            console.log("check");
        });

        socket.on("draw", (data : {message : string})=>{
            set({ gameStatus : "draw"});
            console.log("Game Drawn", data.message);
        });

        socket.on("Game-over", (data: {
            winner: string;
            message: string;
        }) => {
            set({ gameStatus: "checkmate" });
            console.log("Game over:", data.message, "Winner:", data.winner);
        });

        socket.on("room-full", (data : { msg : string})=>{
            console.error(data.msg);
        });

        socket.on("error", (data: { code: string; message: string }) => {
            console.error("Room error:", data.message);
        });

    },

    cleanUpListeners : ()=>{
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("game-started");
        socket.off("move-played");
        socket.off("invalid-move");
        socket.off("invalid-chance");
        socket.off("check");
        socket.off("draw");
        socket.off("Game-over");
    },

    setBoard : () => {
        set((e)=>({
            board : e.chess.board()
        }))
    },

    setSelected : (sq) => {
        const chess = get().chess;
        const playerColor = get().playerColor;
        const currentTurn = get().currentTurn;

        const isPlayerTrun = (playerColor === "White" && currentTurn == "w") || (playerColor === "Black" && currentTurn === "b")

        if (!isPlayerTrun){
            console.log("Not your turn");
            return;
        }

        if (sq){
            const piece = chess.get(sq as Square);
            //Only if its your piece
            if (piece &&
                ((playerColor === "White" && piece.color === "w") || 
                (playerColor === "Black" && piece.color === "b"))
            ){
                const moves = chess.moves({square : sq as Square});
                set({
                    selected : sq,
                    legalMoves : moves
                });
            }
        }
        else{
            set({selected : sq, legalMoves : []})
        }
    },

    resetSelected() {
        set({selected : null})
    },

    setLegalMoves : (moves) => {
        set({legalMoves : moves});
    },

    setHistory : (move) => {
        set({history : move});
    },

    makeMove : (from, to) => {
        console.log("ON make move");
        const chess = get().chess;
        const capturedPieces = get().capturedPieces;
        const socket = useAuthStore.getState().socket;
        const playerColor = get().playerColor;
        const currentTurn = get().currentTurn;

                
        try {
            console.log("Player color " , playerColor);
            const isPlayerTurn = 
            (playerColor === "White" && currentTurn === "w") ||
            (playerColor === "Black" && currentTurn === "b");
        
            if (!isPlayerTurn) {
                console.log("Not your turn!");
                return false;
            }

            if (socket === null){
                return false;
            }

            socket.emit("move", {from, to});
            
            const optimistic_board = new Chess(chess.fen());
            optimistic_board.move({from, to});

            set({
                board : optimistic_board.board(),
                selected : null,
                legalMoves : [],
            })
            return true;
        } catch (error) {
            console.warn("Invalid Move (caught)", from, to);
            return false;
        }
    },
}));

