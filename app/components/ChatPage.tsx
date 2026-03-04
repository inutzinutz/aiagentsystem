'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'สวัสดีครับ! ผม OpenClaw AI Agent powered by Gemini ยินดีให้ความช่วยเหลือครับ' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '...' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: data.content || data.error || 'เกิดข้อผิดพลาด',
        }
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl h-[calc(100vh-160px)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg whitespace-pre-wrap text-sm ${
              msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-100'
            }`}>
              {msg.content === '...' ? <span className="animate-pulse">กำลังคิด...</span> : msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm"
          >
            ส่ง
          </button>
        </div>
      </form>
    </div>
  )
}
