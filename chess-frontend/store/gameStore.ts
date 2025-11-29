import { create } from "zustand";
import { Chess } from "chess.js";

interface GameState {
    chess : Chess,
    board : ReturnType<Chess['board']> | null,

    selected : string | null,
    setSelected : (sq : string | null) => void;
    resetSelected : () => void;

    legalMoves : string[];
    setLegalMoves : (moves : string[]) => void;
    history : string[],
    setHistory : (moves : string[]) => void;

    setBoard : () => void;
    
    makeMove : (from : string, to : string) => boolean;
}


export const useGameStore = create<GameState>((set, get)=>({
    chess : new Chess(),
    board : null,
    selected : null,
    toSelectedSquare : null,
    toSquare : null,
    legalMoves: [],
    history : [],

    setBoard : () => {
        set((e)=>({
            board : e.chess.board()
        }))
    },
    setSelected : (sq) => {
        set({selected : sq})
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
        const chess = get().chess;
        try {
            const move = chess.move({from, to});
            if (!move){
                console.warn("Invalid Move", from, to);
                return false;
            }
            set({
                board : chess.board(),
                selected : null
            })
            return true;
        } catch (error) {
            console.warn("Invalid Move (caught)", from, to);
            return false;
        }
    },
}));

