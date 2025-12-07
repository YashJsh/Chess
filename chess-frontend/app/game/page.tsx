"use client"

import { Room } from '@/components/game/room'
import { useGameConnect } from '@/hooks/use-game-connection';
import { useAuthStore } from '@/store/useAuthStore';

const Game = () => {

  const { socket } = useAuthStore();  
  useGameConnect();

  return (
    <div className="w-screen h-screen">
      <div
        className="
          flex flex-col 
          items-center justify-center 
          gap-6 
          h-full 
          px-4
          md:flex-row md:gap-10 md:px-10
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
