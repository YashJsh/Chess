import { Room } from '@/components/game/room'
import React from 'react'

const Game = () => {
  return (
    <div className='w-screen h-screen'>
        <div className='flex gap-5 items-center justify-center h-full px-10'>
            <Room roomType="Create-room" description="Create a room to play with your friend"/>
            <Room roomType="Join-room" description="Join a room to play with your friend"/>
        </div>
    </div>
  )
}

export default Game