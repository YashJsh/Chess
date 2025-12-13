import { create } from "zustand";
import { Chess, Square } from "chess.js";
import { Piece } from "@/components/game/square";
import { useAuthStore } from "./useAuthStore";
import { game_ended, game_started, invalid_chance, invalid_move, move_played, player_disconnect, player_reconnected, reconnected_game, room_response } from "@/types/game";
import { playCaptureSound, playMoveSound } from "@/lib/sound";
import { toast } from "sonner";

interface GameState {
    chess: Chess,
    board: ReturnType<Chess['board']> | null,
    capturedPieces: Piece[],
    checkSquare: string | null,

    playerColor: "White" | "Black" | null;
    currentTurn: "w" | "b" | null;

    selected: string | null,
    setSelected: (sq: string | null) => void;
    resetSelected: () => void;

    legalMoves: string[];
    setLegalMoves: (moves: string[]) => void;
    history: string[],

    setBoard: () => void;
    makeMove: (from: string, to: string, promotion?: string) => boolean;

    joinRoom: (roomId: string) => void;
    createRoom: () => void;

    roomId: string | null;
    playerId: string | null;
    gameStatus: "waiting" | "playing" | "checkmate" | "draw" | "check";

    initializeGameListeners: () => void;
    cleanUpListeners: () => void;

    promotionData: { from: string, to: string } | null;
    setPromotionData: (data: { from: string, to: string }) => void;
    handlePromotion: (piece: "q" | "r" | "b" | "n") => void;

    showPromotionModal: boolean;
    setShowPromotionModal: (show: boolean) => void;

    roomError: string | null;
    setRoomError: (error: string | null) => void;

    showDisconnectTimer: boolean;
    setShowDisconnectTimer: (show: boolean) => void;
    disconnectPlayer: "White" | "Black" | null;

    resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    chess: new Chess(),
    board: null,
    selected: null,
    toSelectedSquare: null,
    toSquare: null,
    legalMoves: [],
    history: [],
    capturedPieces: [],
    roomId: null,
    playerId: null,
    playerColor: "White" as const,
    currentTurn: null,
    gameStatus: "waiting" as const,
    checkSquare: null,
    promotionData: null,
    showPromotionModal: false,
    roomError: null,
    showDisconnectTimer: false,
    disconnectPlayer: null,

    resetGame: () => {
        set({
            chess: new Chess(),
            board: null,
            selected: null,
            legalMoves: [],
            history: [],
            capturedPieces: [],
            roomId: null,
            playerId: null,
            playerColor: "White",
            currentTurn: null,
            gameStatus: "waiting",
            checkSquare: null,
            promotionData: null,
            showPromotionModal: false,
            roomError: null,
            showDisconnectTimer: false,
            disconnectPlayer: null,
        });
    },


    createRoom: () => {
        const socket = useAuthStore.getState().socket;
        if (socket === null) return;
        socket.emit("create-room");
    },

    joinRoom: (roomId: string) => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.emit("join-room", { roomId });
    },

    initializeGameListeners: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) {
            console.log("Socket is not present");
            return;
        };

        console.log("✅ Initializing game listeners on socket:", socket.id);

        socket.on("room-created", (data: room_response) => {
            console.log("ROOM CREATED RESPONSE");
            set({ roomId: data.room, playerId: data.player_id })
            localStorage.setItem("playerId", data.player_id);
            localStorage.setItem("roomId", data.room);
            console.log(data.message);
        });

        socket.on("room-joined", (data: room_response) => {
            set({ roomId: data.room, playerId: data.player_id });
            localStorage.setItem("playerId", data.player_id);
            localStorage.setItem("roomId", data.room);
            console.log(data.message);
        });


        //Game started : 
        socket.on("game-started", (data: game_started) => {
            console.log("Game-started event");
            const chess = new Chess(data.board);
            set({
                chess,
                board: chess.board(),
                playerColor: data.color,
                currentTurn: data.playertoMove as "w" | "b",
                gameStatus: "playing",
                history: chess.history(),
            })
            console.log("Game started : You are : ", data.color);
        });

        socket.on("move-played", (data: move_played) => {
            const newChess = new Chess(data.board);

            let checksq = get().checkSquare;

            if (newChess.isCheck()) {
                const turn = data.turn;
                const kingPos = newChess.board().flat().find((sq) => {
                    return sq?.type === "k" && sq.color === turn
                });
                if (kingPos) checksq = kingPos.square;
            } else {
                checksq = null;
            }

            const oldChess = get().chess;
            const captured = oldChess.get(data.lastMove.to as Square);


            if (captured) {
                playCaptureSound();
            } else {
                playMoveSound();
            }

            set({
                chess: newChess,
                board: newChess.board(),
                currentTurn: data.turn as "w" | "b",
                selected: null,
                legalMoves: [],
                history: data.moveHistory.map(s => s.san),
                capturedPieces: data.capturedPieces as Piece[],
                gameStatus: newChess.isCheck() ? "check" : "playing",
                checkSquare: checksq
            });
        });

        socket.on("invalid-move", (data: invalid_move) => {
            console.warn("Server Rejected move : ", data.message);
            set({
                selected: null,
                legalMoves: []
            })
        });

        socket.on("invalid-chance", (data: invalid_chance) => {
            console.warn(data.message);
            set({
                selected: null,
                legalMoves: []
            })
        });

        socket.on("check", (data: { message: string }) => {
            set({ gameStatus: "check" })
            console.log("check");
        });

        socket.on("draw", (data: { message: string }) => {
            set({ gameStatus: "draw" });
            console.log("Game Drawn", data.message);
        });

        socket.on("Game-over", (data: {
            winner: string;
            message: string;
        }) => {
            set({ gameStatus: "checkmate" });
            console.log("Game over:", data.message, "Winner:", data.winner);
        });

        socket.on("room-full", (data: { code: string, message: string }) => {
            set({
                roomError: data.code,
            })
            console.error(data.message);
        });

        socket.on("error-room", (data: { code: string; message: string }) => {
            set({
                roomError: data.code,
            })
            console.error("Room error:", data.message);
        });

        socket.on("promotion-required", (data: { from: string, to: string, promotion: string }) => {
            set({
                promotionData: {
                    from: data.from,
                    to: data.to,
                },
                showPromotionModal: true,
            })
        });

        socket.on("reconnected-game", (data: reconnected_game) => {
            const restoredChess = new Chess(data.board);

            set({
                chess: restoredChess,
                board: restoredChess.board(),
                playerColor: data.color,
                currentTurn: data.turn as "w" | "b",
                history: data.history.map(s => s.san),
                gameStatus: restoredChess.isCheck() ? "check" : "playing",
                capturedPieces: data.capturedPieces as Piece[]
            });
            console.log("♻ Successfully restored game state.");
        });

        socket.on("player-disconnected", (data: player_disconnect) => {
            toast.warning(data.message);
            set({
                showDisconnectTimer: true,
                disconnectPlayer: data.disconnectedPlayer
            })
        });

        //Player-reconnected is for ui only, timer thing.
        socket.on("player-reconnected", (data: player_reconnected) => {
            toast.success(data.message);
            set({
                showDisconnectTimer: false,
                disconnectPlayer: null,
            });
        });

        socket.on("game-ended", (data: game_ended) => {
            toast.error(data.message);
            set({
                gameStatus: "checkmate", //Here game ends in a forfiet
                showDisconnectTimer: false,
                disconnectPlayer: null,
            })
        })
    },

    setShowPromotionModal: (show) => set({
        showPromotionModal: show
    }),

    cleanUpListeners: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("game-started");
        socket.off("move-played");
        socket.off("invalid-move");
        socket.off("invalid-chance");
        socket.off("check");
        socket.off("draw");
        socket.off("Game-over");
        socket.off("error-room");
        socket.off("room-full");
        socket.off("player-disconnected");
        socket.off("player-reconnected");
        socket.off("game-ended");
    },

    setBoard: () => {
        set((e) => ({
            board: e.chess.board()
        }))
    },

    setSelected: (sq) => {
        const chess = get().chess;
        const playerColor = get().playerColor;
        const currentTurn = get().currentTurn;

        const isPlayerTrun = (playerColor === "White" && currentTurn == "w") || (playerColor === "Black" && currentTurn === "b")

        if (!isPlayerTrun) {
            console.log("Not your turn");
            return;
        }

        if (sq) {
            const piece = chess.get(sq as Square);
            //Only if its your piece
            if (piece &&
                ((playerColor === "White" && piece.color === "w") ||
                    (playerColor === "Black" && piece.color === "b"))
            ) {
                const moves = chess.moves({ square: sq as Square });
                set({
                    selected: sq,
                    legalMoves: moves
                });
            } else {
                set({ selected: null, legalMoves: [] })
            }
        }
        else {
            set({ selected: sq, legalMoves: [] })
        }
    },

    resetSelected() {
        set({ selected: null })
    },

    setLegalMoves: (moves) => {
        set({ legalMoves: moves });
    },



    setPromotionData: (data) => {
        set({ promotionData: data })
    },

    handlePromotion: (piece) => {
        console.log("INSIDE HANDLE PROMOTION ❤️");
        console.log("PROMOTION DATA");

        const { promotionData } = get();
        console.log(promotionData);
        if (!promotionData) {
            return;
        }
        get().makeMove(promotionData.from, promotionData.to, piece);
        set({
            promotionData: null,
            showPromotionModal: false
        })
    },

    makeMove: (from, to, promotion) => {
        console.log("ON make move");
        const chess = get().chess;
        const socket = useAuthStore.getState().socket;
        const playerColor = get().playerColor;
        const currentTurn = get().currentTurn;


        try {
            console.log("Player color ", playerColor);
            const isPlayerTurn =
                (playerColor === "White" && currentTurn === "w") ||
                (playerColor === "Black" && currentTurn === "b");

            if (!isPlayerTurn) {
                console.log("Not your turn!");
                return false;
            }

            if (socket === null) {
                return false;
            }

            socket.emit("move", { from, to, promotion });

            const optimistic_board = new Chess(chess.fen());
            optimistic_board.move({ from, to });

            set({
                board: optimistic_board.board(),
                selected: null,
                legalMoves: [],
                showPromotionModal: false
            })
            return true;
        } catch (error) {
            console.warn("Invalid Move (caught)", from, to);
            return false;
        }
    },

    setRoomError: (error) => {
        set({
            roomError: error
        })
    },

    setShowDisconnectTimer: (show) => {
        set({
            showDisconnectTimer: show
        })
    },

}));

