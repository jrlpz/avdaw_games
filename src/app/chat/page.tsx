"use client";

import { useState } from "react";
import { RealtimeChat } from "@/components/realtime-chat";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-2xl flex flex-col gap-4"
             style={{ maxHeight: 'calc(100vh - 190px)' }}
        >
            <Input
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                    bg-gray-500
                    text-white
                    placeholder:text-white
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-purple-500
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-gray-800
                    focus-visible:border-gray-500
                    w-full
                "
            />

            <div
                className="border border-gray-300 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 overflow-hidden flex flex-col "
                style={{ position: 'relative', height: '500px' }} // Add position relative
            >

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <RealtimeChat
                        roomName="avdaw-chat"
                        username={username}
                        disabled={!username} // Pass the disabled prop
                    />
                </div>

            </div>
        </div>
    </div>
);
}