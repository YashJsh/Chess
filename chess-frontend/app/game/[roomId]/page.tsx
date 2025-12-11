"use client"

import { ChessBoard } from '@/components/game/board'
import { Captured } from '@/components/game/captured'
import { Moves } from '@/components/game/history'
import { Result } from '@/components/game/result'
import { DisconnectTimer } from '@/components/game/timer'
import { useGameConnect } from '@/hooks/use-game-connection'
import { GameRouteGuard } from '@/middleware/gameroute'
import { useGameStore } from '@/store/gameStore'


const ChessGame = () => {
  useGameConnect();
  const { showDisconnectTimer, disconnectPlayer} = useGameStore();

  return (
    <GameRouteGuard>
      <div
        className="
        w-screen h-screen 
        flex flex-col
        md:grid md:grid-cols-3
      "
      >
        <div
          className="
          flex items-center justify-center
          p-2
          bg-transparent
          md:col-span-2
        "
        >
          <ChessBoard />
        </div>

        <div
          className="
          bg-white shadow-lg 
          p-4 flex flex-col gap-4
          md:col-span-1
          md:h-screen
          md:overflow-hidden
        "
        >
          <div className="px-6 py-4 bg-primary rounded-xl text-white">
            <h2 className="text-xl font-bold tracking-wide">Game Analysis</h2>
            <p className="text-xs mt-1">Track moves & captures</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <Moves />
          </div>

          <div className="mt-auto">
            <Captured />
          </div>
        </div>
        <Result />
        <DisconnectTimer
          isOpen = {showDisconnectTimer}
          disconnectedPlayer={disconnectPlayer as "White" | "Black"}
          initialSeconds={15}
        />
      </div>
    </GameRouteGuard>
  )
}

export default ChessGame;
