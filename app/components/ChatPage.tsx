'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  fileInfo?: string
}

const AGENTS = [
  { id: 'general', name: 'General Agent', prompt: '' },
  { id: 'sales', name: 'Sales Agent', prompt: 'คุณเป็น Sales Agent ผู้เชี่ยวชาญการวิเคราะห์ยอดขายและกลยุทธ์การขาย' },
  { id: 'support', name: 'Support Agent', prompt: 'คุณเป็น Support Agent ที่เป็นมิตร ช่วยแก้ปัญหาและตอบคำถามลูกค้า' },
  { id: 'data', name: 'Data Agent', prompt: 'คุณเป็น Data Agent ผู้เชี่ยวชาญการวิเคราะห์ข้อมูลและสถิติ' },
  { id: 'code', name: 'Code Agent', prompt: 'คุณเป็น Code Agent ผู้เชี่ยวชาญการเขียนโค้ดและแก้บัก ตอบด้วย code blocks เสมอ' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'สวัสดีครับ! ผม OpenClaw AI Agent ✨\nพูดหรือพิมพ์ได้เลย รองรับไฟล์และรูปภาพด้วยครับ' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0])
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return alert('เบราว์เซอร์นี้ไม่รองรับ Voice Input')
    const rec = new SR()
    rec.lang = 'th-TH'
    rec.continuous = false
    rec.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => setInput(prev => prev + e.results[0][0].transcript)
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const handleFile = (f: File) => {
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setFilePreview(null)
    }
  }

  const clearFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !file) || isLoading) return

    const userText = input.trim() || `วิเคราะห์ไฟล์: ${file?.name}`
    setInput('')

    const userMsg: Message = { role: 'user', content: userText, fileInfo: file?.name }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '...' }])

    try {
      let fileData = null
      if (file) {
        const reader = new FileReader()
        fileData = await new Promise<{ data: string; mimeType: string }>(resolve => {
          reader.onload = e => {
            const result = e.target?.result as string
            resolve({ data: result.split(',')[1], mimeType: file.type })
          }
          reader.readAsDataURL(file)
        })
        clearFile()
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, systemPrompt: selectedAgent.prompt || undefined, fileData }),
      })
      const data = await res.json()
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: data.content || data.error || 'เกิดข้อผิดพลาด' }
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

  const formatContent = (content: string) => {
    return content.split('```').map((part, i) => {
      if (i % 2 === 1) {
        const lines = part.split('\n')
        const lang = lines[0]
        const code = lines.slice(1).join('\n')
        return (
          <pre key={i} className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs overflow-x-auto my-2">
            {lang && <div className="text-purple-400 text-[10px] mb-1">{lang}</div>}
            <code className="text-green-300">{code}</code>
          </pre>
        )
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>
    })
  }

  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="px-4 py-3 border-b border-gray-800/60 flex items-center gap-3 flex-wrap">
        <select
          value={selectedAgent.id}
          onChange={e => setSelectedAgent(AGENTS.find(a => a.id === e.target.value) || AGENTS[0])}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'เริ่มต้นการสนทนาใหม่ครับ 👋' }])}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors">
          🗑 ล้างแชท
        </button>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-600">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          Gemini 1.5 Flash
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5">🦞</div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-100 rounded-tl-none'}`}>
              {msg.fileInfo && <div className="text-[10px] opacity-70 mb-1">📎 {msg.fileInfo}</div>}
              {msg.content === '...'
                ? <div className="flex gap-1 py-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                : <div className="leading-relaxed">{formatContent(msg.content)}</div>
              }
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5">👤</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {file && (
        <div className="mx-4 mb-2 flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-xs">
          {filePreview ? <img src={filePreview} className="w-10 h-10 rounded object-cover" alt="preview" /> : <span className="text-2xl">📄</span>}
          <span className="text-gray-300 truncate flex-1">{file.name}</span>
          <button onClick={clearFile} className="text-gray-500 hover:text-red-400">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800/60">
        <div className="flex gap-2 items-end">
          <input type="file" ref={fileRef} className="hidden" accept="image/*,.pdf,.txt,.csv,.json,.md"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors" title="แนบไฟล์">📎</button>
          <button type="button" onClick={isListening ? stopListening : startListening}
            className={`p-2.5 rounded-lg transition-colors ${isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Voice Input">🎙</button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={isListening ? '🎙 กำลังฟัง...' : 'พิมพ์ข้อความหรือแนบไฟล์...'}
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
          <button type="submit" disabled={isLoading || (!input.trim() && !file)}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {isLoading ? '⏳' : '▶'}
          </button>
        </div>
        {isListening && <p className="text-red-400 text-[10px] mt-1 ml-2">● กำลังฟัง... กดอีกครั้งเพื่อหยุด</p>}
      </form>
    </div>
  )
}
