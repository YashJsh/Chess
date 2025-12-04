"use client"

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const router = useRouter();
  const { connectSocket } = useAuthStore();
  
  useEffect(()=>{
    connectSocket()
  },[])

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className = "text-center flex flex-col items-center gap-3">
        <Image src={"/amazon-b.svg"} alt="amazon-b" width={100} height={100}/>
        <h1 className = "text-4xl font-bold">Welcome to Chess Hub</h1>
        <h4>Play chess with your friend</h4>
        <Button className="rounded-2xl px-5" variant={"outline"} onClick={() => {router.push("/game")}}>Play</Button>
      </div>
    </div>
  );
}
 