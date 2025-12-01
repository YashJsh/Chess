import { create } from "zustand";
import { Chess, Square } from "chess.js";
import { Piece } from "@/components/game/square";

interface GameState {
    chess : Chess,
    board : ReturnType<Chess['board']> | null,
    capturedPieces : Piece[],

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
    capturedPieces : [],

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
        const capturedPieces = get().capturedPieces;
    
        try {
            const captured = chess.get(to as Square);
            const move = chess.move({from, to});
            if (!move){
                console.warn("Invalid Move", from, to);
                return false;
            }
            let newCapturedPiece = [...capturedPieces];
            if (captured){
                const pieceNotation = captured.color === "w" 
                 ? captured.type.toUpperCase()
                 : captured.type.toLowerCase()

                newCapturedPiece.push(pieceNotation as Piece)
            }
            set({
                board : chess.board(),
                selected : null,
                history : chess.history(),
                capturedPieces : newCapturedPiece
            })
            return true;
        } catch (error) {
            console.warn("Invalid Move (caught)", from, to);
            return false;
        }
    },
}));

