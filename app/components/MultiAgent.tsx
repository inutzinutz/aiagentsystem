'use client'

import { useState } from 'react'

interface Agent {
  id: number
  name: string
  role: string
  model: string
  status: 'online' | 'idle' | 'offline'
  prompt: string
  color: string
}

const defaultAgents: Agent[] = [
  { id: 1, name: 'Sales Agent', role: 'วิเคราะห์ยอดขายและสร้างรายงาน', model: 'Gemini Pro', status: 'online', prompt: 'คุณเป็น Sales Agent ผู้เชี่ยวชาญการวิเคราะห์ยอดขาย', color: 'purple' },
  { id: 2, name: 'Support Agent', role: 'ตอบคำถามและช่วยเหลือลูกค้า', model: 'Gemini Pro', status: 'online', prompt: 'คุณเป็น Support Agent ที่เป็นมิตรและช่วยเหลือลูกค้า', color: 'blue' },
  { id: 3, name: 'Data Agent', role: 'ดึงและวิเคราะห์ข้อมูล', model: 'Gemini Pro', status: 'idle', prompt: 'คุณเป็น Data Agent ผู้เชี่ยวชาญการวิเคราะห์ข้อมูล', color: 'green' },
  { id: 4, name: 'Report Agent', role: 'สร้างรายงานและสรุปผล', model: 'Gemini Pro', status: 'offline', prompt: 'คุณเป็น Report Agent ที่สร้างรายงานได้อย่างละเอียด', color: 'yellow' },
]

const colorMap: Record<string, string> = {
  purple: 'border-purple-600 bg-purple-900/20',
  blue: 'border-blue-600 bg-blue-900/20',
  green: 'border-green-600 bg-green-900/20',
  yellow: 'border-yellow-600 bg-yellow-900/20',
}

const statusColor: Record<string, string> = {
  online: 'bg-green-400',
  idle: 'bg-yellow-400',
  offline: 'bg-gray-600',
}

export default function MultiAgent() {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)
  const [selected, setSelected] = useState<Agent | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastResult, setBroadcastResult] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const openEdit = (agent: Agent) => {
    setSelected(agent)
    setEditPrompt(agent.prompt)
  }

  const savePrompt = () => {
    if (!selected) return
    setAgents(prev => prev.map(a => a.id === selected.id ? { ...a, prompt: editPrompt } : a))
    setSelected(null)
  }

  const toggleStatus = (id: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a
      const next: Record<string, 'online' | 'idle' | 'offline'> = { online: 'idle', idle: 'offline', offline: 'online' }
      return { ...a, status: next[a.status] }
    }))
  }

  const broadcast = async () => {
    if (!broadcastMsg.trim()) return
    setLoading(true)
    setBroadcastResult([])
    const onlineAgents = agents.filter(a => a.status === 'online')
    const results: string[] = []
    for (const agent of onlineAgents) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: `${agent.prompt}\n\nคำถาม: ${broadcastMsg}` }
            ]
          })
        })
        const data = await res.json()
        results.push(`**${agent.name}:** ${data.content || 'ไม่มีคำตอบ'}`)
      } catch {
        results.push(`**${agent.name}:** เกิดข้อผิดพลาด`)
      }
    }
    setBroadcastResult(results)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className={`border rounded-xl p-5 ${colorMap[agent.color]}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColor[agent.status]} ${agent.status === 'online' ? 'animate-pulse' : ''}`}></span>
                <h3 className="text-white font-semibold">{agent.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(agent.id)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded">
                  {agent.status === 'online' ? 'หยุด' : agent.status === 'idle' ? 'ปิด' : 'เปิด'}
                </button>
                <button onClick={() => openEdit(agent)} className="text-xs bg-purple-900/50 hover:bg-purple-800/50 text-purple-400 px-2 py-1 rounded">
                  แก้ไข
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">{agent.role}</p>
            <p className="text-gray-600 text-xs line-clamp-2">{agent.prompt}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{agent.model}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                agent.status === 'online' ? 'bg-green-900/50 text-green-400' :
                agent.status === 'idle' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-800 text-gray-500'
              }`}>{agent.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-2">Broadcast Message</h2>
        <p className="text-gray-500 text-xs mb-4">ส่งข้อความหา agents ที่ online ทั้งหมดพร้อมกัน</p>
        <div className="flex gap-3">
          <input
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            placeholder="พิมพ์คำถามหรือคำสั่ง..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={broadcast}
            disabled={loading || !broadcastMsg.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'กำลังส่ง...' : '📡 Broadcast'}
          </button>
        </div>
        {broadcastResult.length > 0 && (
          <div className="mt-4 space-y-3">
            {broadcastResult.map((r, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap">{r}</div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-white font-semibold mb-4">แก้ไข System Prompt: {selected.name}</h3>
            <textarea
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">ยกเลิก</button>
              <button onClick={savePrompt} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
