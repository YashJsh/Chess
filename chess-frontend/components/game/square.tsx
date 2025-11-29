import Image from "next/image";
import { pieces_map } from "../constants/pieces";


export type Piece = keyof typeof pieces_map | "";

export const Squares = ({ piece, isLight, row, col, onClick, isLegal, isSelected }: { piece: Piece, isLight: boolean, isLegal: boolean, isSelected: boolean, row: number, col: number, onClick: () => void }) => {
    const bgColor = isLight ? "bg-white" : "bg-primary";
    return (
        <div
            onClick={onClick}
            className={`${bgColor} w-20 h-20 flex items-center justify-center text-5xl cursor-pointer hover:opacity-80 transition-opacity
            `}
            
        >
            {/* LEGAL MOVE DOT */}
            {isLegal && piece === "" && (
                <div className="w-4 h-4 rounded-full bg-black/40"></div>
            )}

            {/* CAPTURE DOT (piece exists) */}
            {isLegal && piece !== "" && (
                <div className="absolute w-6 h-6 rounded-full border-4 border-black/40"></div>
            )}
            
            {piece !== "" && (
                <Image
                    src={pieces_map[piece]}
                    alt={piece}
                    width={70}
                    height={70}
                    priority
                />
            )}
    </div>
    )
}   