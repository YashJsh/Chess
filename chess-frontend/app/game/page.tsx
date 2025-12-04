"use client"

import { Room } from '@/components/game/room'
import { useGameConnect } from '@/hooks/use-game-connection';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react'



const Game = () => {

  const { socket } = useAuthStore();
  
  useGameConnect();

  return (
    <div className='w-screen h-screen'>
        <h1>{socket?.id}</h1>
        <div className='flex gap-5 items-center justify-center h-full px-10'>
            <Room roomType="Create-room" description="Create a room to play with your friend"/>
            <Room roomType="Join-room" description="Join a room to play with your friend"/>
        </div>
    </div>
  )
}

export default Game