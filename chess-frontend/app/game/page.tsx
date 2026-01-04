"use client"

import { Room } from '@/components/game/room'
import { useGameConnect } from '@/hooks/use-game-connection';
import { useAuthStore } from '@/store/useAuthStore';


const Game = () => {
  const { socket } = useAuthStore();  
  useGameConnect();

  return (
    <div className="relative w-screen h-screen">
        <div 
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(to right, #E5E5E5 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem',
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
        }}
      />
      <div
        className="
          flex flex-col 
          items-center justify-center 
          gap-6 
          h-full 
          px-4
          md:flex-row md:gap-10 md:px-10
          z-10
          relative
        "
      >
        <Room
          roomType="Create-room"
          description="Create a room to play with your friend"
        />
        <Room
          roomType="Join-room"
          description="Join a room to play with your friend"
        />
      </div>
    </div>
  )
}

export default Game
