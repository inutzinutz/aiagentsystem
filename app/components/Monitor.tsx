'use client'

import { useState, useEffect } from 'react'

type LogLevel = 'info' | 'warn' | 'error' | 'success'

interface Log {
  id: number
  time: string
  level: LogLevel
  agent: string
  message: string
}

const levelColor: Record<LogLevel, string> = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-green-400',
}
const levelBg: Record<LogLevel, string> = {
  info: 'bg-blue-900/30',
  warn: 'bg-yellow-900/30',
  error: 'bg-red-900/30',
  success: 'bg-green-900/30',
}

const mockLogs: Log[] = [
  { id: 1, time: '09:00:01', level: 'success', agent: 'Sales Agent', message: 'Task completed: วิเคราะห์ยอดขาย' },
  { id: 2, time: '09:05:23', level: 'info', agent: 'Data Agent', message: 'ดึงข้อมูลจาก Google Sheet สำเร็จ' },
  { id: 3, time: '09:12:45', level: 'warn', agent: 'Support Agent', message: 'Response time สูงกว่าปกติ (3.2s)' },
  { id: 4, time: '09:30:11', level: 'error', agent: 'Report Agent', message: 'Failed to send email: SMTP timeout' },
  { id: 5, time: '10:00:00', level: 'info', agent: 'Sales Agent', message: 'เริ่ม task ใหม่: สร้างรายงาน Q1' },
  { id: 6, time: '10:15:33', level: 'success', agent: 'Data Agent', message: 'บันทึกข้อมูลสำเร็จ 1,247 records' },
]

const perfData = [
  { agent: 'Sales Agent', cpu: 45, memory: 62, latency: '1.2s' },
  { agent: 'Support Agent', cpu: 23, memory: 41, latency: '3.2s' },
  { agent: 'Data Agent', cpu: 12, memory: 28, latency: '0.8s' },
  { agent: 'Report Agent', cpu: 0, memory: 5, latency: 'N/A' },
]

export default function Monitor() {
  const [logs, setLogs] = useState<Log[]>(mockLogs)
  const [filter, setFilter] = useState<LogLevel | 'all'>('all')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      const levels: LogLevel[] = ['info', 'success', 'warn']
      const agents = ['Sales Agent', 'Support Agent', 'Data Agent']
      const msgs = ['Heartbeat OK', 'API call สำเร็จ', 'กำลังประมวลผล...', 'Cache updated']
      setLogs(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString('th-TH'),
        level: levels[Math.floor(Math.random() * levels.length)],
        agent: agents[Math.floor(Math.random() * agents.length)],
        message: msgs[Math.floor(Math.random() * msgs.length)],
      }, ...prev.slice(0, 19)])
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter)

  return (
    <div className="space-y-6">
      {/* Performance */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Performance</h2>
        <div className="space-y-3">
          {perfData.map(p => (
            <div key={p.agent} className="grid grid-cols-4 gap-4 items-center bg-gray-800/50 rounded-lg p-3">
              <p className="text-white text-sm">{p.agent}</p>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">CPU</span>
                  <span className="text-blue-400">{p.cpu}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${p.cpu}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Memory</span>
                  <span className="text-purple-400">{p.memory}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${p.memory}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-yellow-400 text-sm font-medium">{p.latency}</p>
                <p className="text-gray-500 text-xs">Latency</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Live Logs</h2>
          <div className="flex gap-2">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
          {filtered.map(log => (
            <div key={log.id} className={`flex gap-3 p-2 rounded ${levelBg[log.level]}`}>
              <span className="text-gray-600 shrink-0">{log.time}</span>
              <span className={`shrink-0 font-bold uppercase ${levelColor[log.level]}`}>[{log.level}]</span>
              <span className="text-gray-400 shrink-0">{log.agent}:</span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-2">● Auto-refresh ทุก 4 วินาที · {time.toLocaleTimeString('th-TH')}</p>
      </div>
    </div>
  )
}
