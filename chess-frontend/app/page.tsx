"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div 
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(to right, #E5E5E5 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem',
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
        }}
      />
      <div className = "text-center flex flex-col items-center gap-3 z-2">
        <Image src={"/amazon-b.svg"} alt="amazon-b" width={100} height={100}/>
        <h1 className = "text-4xl font-bold">Welcome to Chess Hub</h1>
        <h4>Play chess with your friend</h4>
        <Button className="rounded-2xl px-5" variant={"outline"} onClick={() => {router.push("/game")}}>Play</Button>
      </div>
    </div>
  );
}
 