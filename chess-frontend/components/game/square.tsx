import Image from "next/image";
import { pieces_map } from "../constants/pieces";
import { url } from "inspector";

export type Piece = keyof typeof pieces_map | "";

export const Square = ({ piece, isLight, row, col }: { piece: Piece, isLight: boolean, row: number, col: number }) => {
    const bgColor = isLight ? "bg-white" : "bg-primary";
    return (
        <div
            className={`${bgColor} w-16 h-16 flex items-center justify-center text-5xl cursor-pointer hover:opacity-80 transition-opacity`}
        >
            {piece !== "" && (
                <Image
                    src={pieces_map[piece]}
                    alt={piece}
                    width={40}
                    height={40}
                    priority
                />
            )}
        </div>
    )
}   