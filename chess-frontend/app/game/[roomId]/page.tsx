"use client"

import { ChessBoard } from '@/components/game/board'
import { useGameStore } from '@/store/gameStore'
import React from 'react'

const ChessGame = () => {
  const { history } = useGameStore();

  return (
    <div className="grid grid-cols-3 h-screen w-screen">
      {/* LEFT: chess board (2 columns) */}
      <div className="col-span-2 flex items-center justify-center bg-gray-200">
        <ChessBoard />
      </div>

      {/* RIGHT: moves panel (1 column) */}
      <div className="col-span-1 bg-white p-4 overflow-y-auto shadow-lg">
        <h1 className="text-xl font-semibold mb-4">Moves</h1>
            {history.map((e)=>(
              <h1>{e}</h1>
            ))}
        
      </div>
    </div>
  )
}

export default ChessGame