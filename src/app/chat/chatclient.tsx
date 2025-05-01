// app/chat/ChatClient.tsx
"use client";

import React from 'react';
import { RealtimeChat } from "@/components/realtime-chat";

export default function ChatClient({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 190px)' }}>
        <div className="border border-gray-300 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 overflow-hidden flex flex-col" style={{ height: '500px' as any }}>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <RealtimeChat
              roomName="avdaw-chat"
              username={username}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}