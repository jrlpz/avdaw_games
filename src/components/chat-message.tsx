import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/hooks/use-realtime-chat'

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: ChatMessageItemProps) => {
  return (
    <div className={`flex mt-2 w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('max-w-[90%] sm:max-w-[80%] md:max-w-[75%] w-fit flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn('flex items-center gap-2 text-xs px-3 w-full', {
              'justify-end flex-row-reverse': isOwnMessage,
            })}
          >
            <span className="font-medium truncate max-w-[120px]">{message.user.name}</span>
            <span className="text-foreground/50 text-xs whitespace-nowrap">
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            'py-2 px-3 rounded-xl text-sm w-full break-words',
            isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-700 text-foreground'
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}