'use client'
import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { type ChatMessage, useRealtimeChat } from '@/hooks/use-realtime-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface RealtimeChatProps {
  roomName: string
  username: string
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
  className?: string
  disabled?: boolean // Added disabled prop
}

export const RealtimeChat = ({
  roomName,
  username,
  onMessage,
  messages: initialMessages = [],
  className,
  disabled = false, // Added default value for disabled
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll()
  const { messages: realtimeMessages, sendMessage, isConnected } = useRealtimeChat({ roomName, username })
  const [newMessage, setNewMessage] = useState('')

  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => m.id === message.id)
    )
    return uniqueMessages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [initialMessages, realtimeMessages])

  useEffect(() => { onMessage?.(allMessages) }, [allMessages, onMessage])
  useEffect(() => { scrollToBottom() }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isConnected || disabled) return  // Check for disabled as well
    sendMessage(newMessage)
    setNewMessage('')
  }, [newMessage, isConnected, sendMessage, disabled]) // Include disabled in dependency array

  return (
    <div className={cn("flex flex-col h-full", className)}>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No hay mensajes. Prueba a escribir algo!
          </div>
        ) : (
          <div className="space-y-1">
            {allMessages.map((message, index) => {
              const showHeader = index === 0 || allMessages[index - 1].user.name !== message.user.name
              return (
                <div key={message.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <ChatMessageItem
                    message={message}
                    isOwnMessage={message.user.name === username}
                    showHeader={showHeader}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-300 dark:border-gray-700 p-4">
            {disabled && (
                <div className="text-sm text-center px-4 pb-2  text-red-600">
                    Introduce un nombre de usuario para empezar a chatear.
                </div>
            )}
            <div className="flex gap-2">
                <Input
                    className={cn(
                        'rounded-full bg-white dark:bg-gray-700 text-sm flex-1',
                        isConnected && newMessage.trim() ? 'mr-2' : ''
                    )}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mensaje"
                    disabled={!isConnected || disabled} // Disable based on isConnected and disabled
                />

                {isConnected && newMessage.trim() && (
                    <Button className="aspect-square rounded-full" type="submit" disabled={!isConnected || disabled}>
                        <Send className="size-4" />
                    </Button>
                )}
            </div>
        </form>
    </div>
)
}