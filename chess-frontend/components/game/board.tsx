"use client"

import { useEffect, useState } from "react";
import { Piece, Squares } from "./square"
import { Chess, Square } from "chess.js"
import { useGameStore } from "@/store/gameStore";
import { useAuthStore } from "@/store/useAuthStore";

export const ChessBoard = () => {
    const { chess, board, setBoard, setSelected, selected, makeMove, resetSelected, setLegalMoves, legalMoves, setHistory } = useGameStore();
    const { connectSocket } = useAuthStore();

    useEffect(() => {
        setBoard();
        connectSocket()
    }, [])

    if (board == null) {
        return;
    }

    const sqToNum = (row: number, col: number) => {
        const files = "abcdefgh";
        const file = files[col];
        const rank = 8 - row;
        return `${file}${rank}`;
    };

    const handleSquareClick = (row: number, col: number) => {

        const square = sqToNum(row, col) as Square;
        const isSameSquare = selected === square;

        // 1️⃣ If no piece selected yet → select this piece
        if (!selected) {
            setSelected(square);

            const moves = chess.moves({ square, verbose: true });
            setLegalMoves(moves.map((m) => m.to));
            return;
        }

        // 2️⃣ If clicking the SAME square → unselect
        if (isSameSquare) {
            resetSelected();
            setLegalMoves([]);
            return;
        }

        // 3️⃣ If clicking ANOTHER friendly piece → reselect it
        const sqObj = chess.get(square);
        const selectedObj = chess.get(selected as Square);

        if (sqObj && selectedObj && sqObj.color === selectedObj.color) {
            // Reselect new piece
            setSelected(square);

            const moves = chess.moves({ square, verbose: true });
            setLegalMoves(moves.map((m) => m.to));
            return;
        }

        // 4️⃣ Attempt to move
        const ok = makeMove(selected, square);

        if (!ok) {
            // Invalid moves: keep current selection or reset if needed
            resetSelected();
            setLegalMoves([]);
            return;
        }

        // 5️⃣ Valid move → clear selection & highlights
        resetSelected();
        setLegalMoves([]);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        {/* Board container with responsive sizing */}
        <div className="w-full max-w-[95vmin] sm:max-w-[90vmin] md:max-w-[85vmin] lg:max-w-[700px] xl:max-w-[800px] aspect-square">
            <div className="w-full h-full p-4 sm:p-6 md:p-8 lg:p-10 bg-primary/40 rounded-xl sm:rounded-2xl">
                <div className="w-full h-full shadow-2xl rounded-lg overflow-hidden">
                    {board.map((row, rowIndex) => {
                        return (
                            <div key={rowIndex} className="flex w-full h-[12.5%]">
                            {row.map((square, colIndex) => {

                                    const isLight = (rowIndex + colIndex) % 2 === 0;

                                    let piece: Piece = "";
                                    if (square) {
                                        const pieceType = square.type.toUpperCase();
                                        piece = (square.color === 'w' ? pieceType : pieceType.toLowerCase()) as Piece;
                                    }
                                    const squareName = sqToNum(rowIndex, colIndex);
                                    const isLegal = legalMoves.includes(squareName);


                                    return (
                                        <Squares
                                            key={colIndex}
                                            piece={piece}
                                            isLight={isLight}
                                            row={rowIndex}
                                            col={colIndex}
                                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                                            isLegal={isLegal}

                                            isCheck={chess.isCheck()}
                                        />
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
        </div>
    )

}

