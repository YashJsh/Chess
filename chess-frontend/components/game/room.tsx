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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useGameStore } from "@/store/gameStore"
import { WaitingModal } from "./waiting"
import { useAuthStore } from "@/store/useAuthStore"


export const Room = ({ roomType, description }: { roomType: string, description: string }) => {
    const [roomIds, setRoomId] = useState("");
    const { createRoom, joinRoom, roomId, timeControl, setTimeControl } = useGameStore();
    const [showWaitingModal, setShowWaitingModal] = useState(false);

    const timeControls = [
        { value: "3", label: "3 min" },
        { value: "5", label: "5 min" },
        { value: "10", label: "10 min" },
        { value: "none", label: "Unlimited" },
    ];

    const handleCreateRoom = () => {
        createRoom(timeControl);
        setShowWaitingModal(true);
    };

    return (
        <>
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
                                onClick={() => {
                                    joinRoom(roomIds);
                                }}
                            >
                                Join Room
                            </Button>
                        </div>
                    )}

                    {/* CREATE ROOM UI */}
                    {roomType === "Create-room" && (
                        !roomId ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Time Control</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {timeControls.map((tc) => (
                                            <Button
                                                key={tc.value}
                                                variant={timeControl === tc.value ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setTimeControl(tc.value)}
                                                className="text-xs"
                                            >
                                                {tc.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => { handleCreateRoom() }}
                                    className="w-full"
                                    size="lg"
                                    variant={"default"}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create New Room
                                </Button>
                            </div>
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
                                            onClick={() => {

                                            }}
                                            className="hover:bg-primary/10"
                                        >
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
            {
                roomId && (
                    <WaitingModal
                        roomId={roomId!}
                        setShowWaitingModal={setShowWaitingModal}
                        showWaitingModal={showWaitingModal}
                    />
                )
            }
        </>
    )
}