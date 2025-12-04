"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Copy, Check } from "lucide-react"
import Image from "next/image"
import { useGameStore } from "@/store/gameStore"

export const Room = ({ roomType, description }: { roomType: string, description: string }) => {
    const router = useRouter();
    const [roomIds, setRoomId] = useState("");
    const {createRoom, joinRoom, roomId} = useGameStore();
    const [copied, setCopied] = useState(false);

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId!);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    console.log("roomId is :", roomId);

    return (
        <Card className="w-full rounded-2xl">
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <Image
                            src={roomType === "Create-room" ? "/rook-b.svg" : "/knight-w.svg"}
                            alt="Amazon Logo"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                        />
                        {roomType}
                    </div>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>

                {/* JOIN ROOM UI */}
                {roomType === "Join-room" && (
                    <div className="flex flex-col gap-3">
                        <Input
                            className="rounded-xl w-full"
                            placeholder="Enter room id"
                            value={roomIds}
                            onChange={(e) => setRoomId(e.target.value)}
                        />

                        <Button
                            className="rounded-xl w-full"
                            onClick={()=>{
                                joinRoom(roomIds);
                                router.push(`/game/${roomIds}`)
                            }}
                        >
                            Join Room
                        </Button>
                    </div>
                )}

                {/* CREATE ROOM UI */}
                {roomType === "Create-room" && (
                    !roomId ? (
                        <Button
                            onClick={()=>{createRoom()}}
                            className="w-full"
                            size="lg"
                            variant={"default"} 
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Room
                        </Button>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-500">
                            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                                <p className="text-sm text-muted-foreground mb-2">Your Room ID</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-xl font-mono font-bold text-foreground">
                                        {roomId}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={()=>{
                                            copyRoomId
                                            setTimeout(()=>{
                                                router.push(`/game/${roomId}`)
                                            }, 1000)

                                        }}
                                        className="hover:bg-primary/10"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}