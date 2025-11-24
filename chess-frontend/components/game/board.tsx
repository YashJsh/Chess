import { Piece, Square } from "./square"


const INITIAL_BOARD : Piece[][]= [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];


export const ChessBoard = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="border-1 shadow-2xl">
                {INITIAL_BOARD.map((row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="flex">
                            {row.map((square, colIndex) => {

                                console.log(colIndex, square);
                                const isLight = (rowIndex + colIndex) % 2 === 0;
                                return (
                                    <Square 
                                        key={colIndex} 
                                        piece={square} 
                                        isLight={isLight} 
                                        row={rowIndex} 
                                        col={colIndex}
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