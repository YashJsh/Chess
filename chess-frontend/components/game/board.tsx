"use client"

import { useEffect } from "react";
import { Piece, Squares } from "./square"
import { Square } from "chess.js"
import { useGameStore } from "@/store/gameStore";


export const ChessBoard = () => {
    const { 
        chess, 
        board, 
        setBoard, 
        setSelected, 
        selected, 
        makeMove, 
        resetSelected, 
        setLegalMoves, 
        legalMoves,
        playerColor 
    } = useGameStore();

    useEffect(() => {
        setBoard();
    }, []);

    if (board == null) {
        return null;
    }

    const isFlipped = playerColor === "Black";
    const files = isFlipped ? "hgfedcba".split("") : "abcdefgh".split("");
    const ranks = isFlipped ? ["1","2","3","4","5","6","7","8"] : ["8","7","6","5","4","3","2","1"];

    const sqToNum = (row: number, col: number) => {
        const fileChars = "abcdefgh";
        const file = fileChars[col];
        const rank = 8 - row;
        return `${file}${rank}`;
    };

    const handleSquareClick = (row: number, col: number) => {
        const square = sqToNum(row, col) as Square;
        const isSameSquare = selected === square;

        console.log("Handle square click");
        console.log("Selected is : ", selected);

        if (!selected) {
            setSelected(square);
            const moves = chess.moves({ square, verbose: true });
            setLegalMoves(moves.map((m) => m.to));
            return;
        }

        if (isSameSquare) {
            resetSelected();
            setLegalMoves([]);
            return;
        }

        const sqObj = chess.get(square);
        const selectedObj = chess.get(selected as Square);

        if (sqObj && selectedObj && sqObj.color === selectedObj.color) {
            setSelected(square);
            const moves = chess.moves({ square, verbose: true });
            setLegalMoves(moves.map((m) => m.to));
            return;
        }

        console.log("Making move");
        const ok = makeMove(selected, square);

        if (!ok) {
            resetSelected();
            setLegalMoves([]);
            return;
        }

        resetSelected();
        setLegalMoves([]);
    };

    const displayBoard = isFlipped ? [...board].reverse() : board;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
            <div className="w-full max-w-[95vmin] sm:max-w-[90vmin] md:max-w-[85vmin] lg:max-w-[700px] xl:max-w-[800px] aspect-square">
                <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 bg-primary/40 rounded-xl sm:rounded-2xl">
                    <div className="relative w-full h-full">
                        {/* Main board with shadow */}
                        <div className="w-full h-full shadow-2xl rounded-lg overflow-hidden">
                            {displayBoard.map((row, rowIndex) => {
                                const actualRowIndex = isFlipped ? (7 - rowIndex) : rowIndex;
                                const displayRow = isFlipped ? [...row].reverse() : row;
                                
                                return (
                                    <div key={actualRowIndex} className="flex w-full h-[12.5%] relative">
                                        {displayRow.map((square, colIndex) => {
                                            const actualColIndex = isFlipped ? (7 - colIndex) : colIndex;
                                            const isLight = (actualRowIndex + actualColIndex) % 2 === 0;

                                            let piece: Piece = "";
                                            if (square) {
                                                const pieceType = square.type.toUpperCase();
                                                piece = (square.color === 'w' ? pieceType : pieceType.toLowerCase()) as Piece;
                                            }
                                            
                                            const squareName = sqToNum(actualRowIndex, actualColIndex);
                                            const isLegal = legalMoves.includes(squareName);
                                            const isSelectedSquare = selected === squareName;

                                            return (
                                                <div key={`${actualRowIndex}-${actualColIndex}`} className="relative w-[12.5%] h-full">
                                                    <Squares
                                                        piece={piece}
                                                        isLight={isLight}
                                                        row={actualRowIndex}
                                                        col={actualColIndex}
                                                        onClick={() => handleSquareClick(actualRowIndex, actualColIndex)}
                                                        isLegal={isLegal}
                                                        isCheck={chess.isCheck()}
                                                    />
                                                    
                                                    {/* File labels (a-h) on bottom row */}
                                                    {actualRowIndex === (isFlipped ? 0 : 7) && (
                                                        <span className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-semibold pointer-events-none select-none"
                                                              style={{ color: isLight ? '#b58863' : '#f0d9b5' }}>
                                                            {files[actualColIndex]}
                                                        </span>
                                                    )}
                                                    
                                                    {/* Rank labels (1-8) on left column */}
                                                    {actualColIndex === (isFlipped ? 7 : 0) && (
                                                        <span className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-semibold pointer-events-none select-none"
                                                              style={{ color: isLight ? '#b58863' : '#f0d9b5' }}>
                                                            {ranks[actualRowIndex]}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};