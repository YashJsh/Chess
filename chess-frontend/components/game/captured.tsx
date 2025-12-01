import { useGameStore } from "@/store/gameStore"
import type { Piece } from "./square";
import { pieces_map } from "../constants/pieces";
import Image from "next/image";


export const Captured = () => {
    const { capturedPieces  } = useGameStore();

    const whiteCaptured = capturedPieces.filter((p): p is Exclude<Piece, ""> => 
        p !== "" && p === p.toUpperCase()
    );
    const blackCaptured = capturedPieces.filter((p): p is Exclude<Piece, ""> => 
        p !== "" && p === p.toLowerCase()
    );

    return (
        <div className="flex flex-col gap-5">
            <div className="text-primary rounded-xl px-2 bg-slate-100 flex gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold  uppercase tracking-tighter ">
                        Black
                    </span>
                </div>
                <div className="flex items-center  flex-wrap min-h-[40px] rounded-lg  ">
                    {whiteCaptured.length > 0 ? (
                        whiteCaptured.map((piece, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center"
                            >
                                <Image
                                    src={pieces_map[piece] }
                                    alt={piece}
                                    width={20}
                                    height={20}
                                    priority
                                />
                            </div>
                        ))
                    ) : (
                        <div className="hidden"></div>
                    )}
                </div>
            </div>

            <div className="bg-primary rounded-xl px-2 text-primary-foreground flex gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold  uppercase tracking-tighter ">
                        White
                    </span>
                </div>
                <div className="flex items-center flex-wrap min-h-[40px] rounded-lg  ">
                    {blackCaptured.length > 0 ? (
                        blackCaptured.map((piece, idx) => (
                            <div
                                key={idx}
                                className=" flex items-center justify-center "
                            >
                                <Image
                                    src={pieces_map[piece] }
                                    alt={piece}
                                    width={20}
                                    height={20}
                                    priority
                                />
                            </div>
                        ))
                    ) : (
                        <div className="hidden"></div>
                    )}
                </div>
            </div>

        </div>
    )
}

