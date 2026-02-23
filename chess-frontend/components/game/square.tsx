import Image from "next/image";
import { pieces_map } from "../constants/pieces";


export type Piece = keyof typeof pieces_map | "";

export const Squares = ({ piece, isLight, row, col, onClick, isLegal, isCheck, isCheckSquare }: { piece: Piece, isLight: boolean, isLegal: boolean, isCheck: boolean, row: number, col: number, onClick: () => void, isCheckSquare: boolean }) => {
    const bgColor = isLight ? "bg-white" : "bg-primary";

    return (
        <div
            onClick={onClick}
            className={`
                    relative
                    ${bgColor}
                    w-full h-full
                    flex items-center justify-center
                    cursor-pointer
                    hover:opacity-80 transition
                `}
        >
            {/* LEGAL MOVE DOT */}
            {isLegal && piece === "" && (
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black/40"></div>
            )}

            {/* CAPTURE DOT */}
            {isLegal && piece !== "" && (
                <div className="absolute w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-black/40"></div>
            )}

            {isCheckSquare && (
                <div className="absolute inset-0 pointer-events-none 
                    bg-[radial-gradient(circle,rgba(255,0,0,0.6)_0%,rgba(255,0,0,0)_70%)] 
                    ">
                </div>
            )}

            {piece !== "" && (
                <Image
                    src={pieces_map[piece]}
                    alt={piece}
                    width={40}
                    height={40}
                    className="w-[90%] h-[90%] object-contain"
                />
            )}
        </div>
    )
}   