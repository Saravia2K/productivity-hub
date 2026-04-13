import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Avatar } from '#/components/ui/avatar'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { teamService } from '#/services/team.service'
import { useAuthStore } from '#/stores/auth.store'
import { getSocket } from '#/lib/socket'
import { formatRelativeTime } from '#/lib/utils'
import type { Team, ChatMessage } from '#/types'

interface TeamChatProps {
  team: Team
}

export function TeamChat({ team }: TeamChatProps) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const loadedTeamRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: chatHistory } = useQuery({
    queryKey: ['team-chat', team._id],
    queryFn: () => teamService.getChatMessages(team._id, { limit: 50 }),
  })

  useEffect(() => {
    if (chatHistory && loadedTeamRef.current !== team._id) {
      setMessages(chatHistory.data ?? [])
      loadedTeamRef.current = team._id
    }
  }, [chatHistory, team._id])

  const handleChatMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.teamId !== team._id) return
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]))
    },
    [team._id],
  )

  useEffect(() => {
    const socket = getSocket()
    socket.on('chat:message', handleChatMessage)
    return () => {
      socket.off('chat:message', handleChatMessage)
    }
  }, [handleChatMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const content = input.trim()
    if (!content || !user) return
    setInput('')

    teamService
      .sendChatMessage(team._id, content)
      .then((msg) => {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]))
      })
      .catch(() => setInput(content))
  }

  return (
    <Card className="flex flex-col h-full max-h-[480px]">
      <CardHeader className="p-4 border-b border-(--line)">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-(--lagoon-deep)" />
          <CardTitle className="text-sm">Canal del equipo</CardTitle>
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En línea
          </span>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.author._id === user?._id
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {!isMe && <Avatar name={msg.author.name} size="xs" />}
              <div
                className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}
              >
                {!isMe && (
                  <span className="text-[10px] text-(--sea-ink-soft) ml-1">{msg.author.name}</span>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isMe
                      ? 'bg-(--lagoon-deep) text-white rounded-br-sm'
                      : 'bg-(--surface) border border-(--line) text-(--sea-ink) rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-(--sea-ink-soft) mx-1">
                  {formatRelativeTime(msg.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-(--line) p-3 flex gap-2">
        <Input
          placeholder="Escribe un mensaje…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
