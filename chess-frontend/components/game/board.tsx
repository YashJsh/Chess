"use client"

import { useEffect, useState } from "react";
import { Piece, Squares } from "./square"
import {Chess, Square} from "chess.js"
import { useGameStore } from "@/store/gameStore";

export const ChessBoard = () => {
    const {chess, board, setBoard, setSelected, selected, makeMove, resetSelected, setLegalMoves, legalMoves, setHistory} = useGameStore();
    
    useEffect(()=>{
        setBoard();
    },[])

    if (board == null){
        return;
    }

    const sqToNum = (row: number, col: number) => {
        const files = "abcdefgh";
        const file = files[col];
        const rank = 8 - row;
        return `${file}${rank}`;
    };

    const handleSquareClick = (row : number, col : number)=>{
        
        const square = sqToNum(row, col);
        const isSelected = selected === square;
        const isLegal = legalMoves.includes(square);

        if (!selected ){
            setSelected(square);
            const move = chess.moves({ square : square as Square, verbose : true})
            console.log(move);

            let str : string[] = [];
            move.map((m, index)=>(
                console.log(m.to),
                str.push(m.to)

            ))
            setLegalMoves(str);
            return;
        }
        const ok = makeMove(selected, square);
        console.log(chess.history());
        setHistory(chess.history());
        resetSelected();
        setLegalMoves([]);

        if (!ok ){
            setSelected(null);
            console.log("Selected is : ",selected);
            console.log("error")
            return;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="border-1 shadow-2xl">
                {board.map((row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="flex">
                            {row.map((square, colIndex) => {

                                const isLight = (rowIndex + colIndex) % 2 === 0;
                                
                                let piece : Piece = "";
                                if (square) {
                                    const pieceType = square.type.toUpperCase();
                                    piece = (square.color === 'w' ? pieceType : pieceType.toLowerCase()) as Piece;
                                }
                                const squareName = sqToNum(rowIndex, colIndex);
                                const isSelected = selected === squareName;
                                const isLegal = legalMoves.includes(squareName);
                                

                                return (
                                    <Squares 
                                        key={colIndex} 
                                        piece={piece} 
                                        isLight={isLight} 
                                        row={rowIndex} 
                                        col={colIndex}
                                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                                        isLegal = {isLegal}
                                        isSelected = {isSelected}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )

}

