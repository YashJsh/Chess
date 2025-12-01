"use client"

import { ChessBoard } from '@/components/game/board'
import { Captured } from '@/components/game/captured'
import { Moves } from '@/components/game/history'
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
      <div className="col-span-1 bg-white p-4  shadow-lg flex flex-col ">
        <div className="px-6 py-4 bg-primary rounded-xl text-white">
          <h2 className="text-xl font-bold tracking-wide">Game Analysis</h2>
          <p className="text-xs mt-1">Track moves & captures</p>
        </div>
        <div className='flex-1 min-h-0'>
          <Moves/>
        </div>
        <div className='mt-auto'>
          <Captured/>
        </div>
      </div>
    </div>
  )
}

export default ChessGame;