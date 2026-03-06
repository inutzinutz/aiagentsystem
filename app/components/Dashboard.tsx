'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Notification } from '../page'

interface Props {
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
}

const agents = [
  { id: 1, name: 'Sales Agent', status: 'online', tasks: 12, success: 95, model: 'Gemini Pro', icon: '💰' },
  { id: 2, name: 'Support Agent', status: 'online', tasks: 8, success: 88, model: 'Gemini Pro', icon: '🎧' },
  { id: 3, name: 'Data Agent', status: 'idle', tasks: 3, success: 100, model: 'Gemini Pro', icon: '📊' },
  { id: 4, name: 'Report Agent', status: 'offline', tasks: 0, success: 72, model: 'Gemini Pro', icon: '📝' },
]

export default function Dashboard({ addNotification }: Props) {
  const [time, setTime] = useState(new Date())
  const [apiCalls, setApiCalls] = useState(1247)
  const [taskCount, setTaskCount] = useState(23)

  const tick = useCallback(() => {
    setTime(new Date())
    setApiCalls(v => v + Math.floor(Math.random() * 3))
    if (Math.random() < 0.05) {
      setTaskCount(v => v + 1)
      addNotification({
        title: 'Task Completed',
        message: `${agents[Math.floor(Math.random() * 3)].name} เสร็จงานใหม่`,
        type: 'success',
        time: 'เพิ่งเกิดขึ้น',
      })
    }
  }, [addNotification])

  useEffect(() => {
    const t = setInterval(tick, 3000)
    return () => clearInterval(t)
  }, [tick])

  const stats = [
    { label: 'Agents Online', value: '3/4', icon: '🤖', color: 'text-green-400' },
    { label: 'Tasks Today', value: taskCount.toString(), icon: '📋', color: 'text-blue-400' },
    { label: 'Success Rate', value: '92%', icon: '✅', color: 'text-purple-400' },
    { label: 'API Calls', value: apiCalls.toLocaleString(), icon: '⚡', color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-white font-semibold">Overview</h2>
          <p className="text-gray-500 text-xs mt-0.5">{time.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className="text-xs bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded-full w-fit">
          ● Live · {time.toLocaleTimeString('th-TH')}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800/60 rounded-xl p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className="text-green-400 text-xs">▲</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agent Status */}
      <div className="bg-gray-900 border border-gray-800/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Agent Status</h2>
          <span className="text-gray-500 text-xs">{agents.filter(a => a.status === 'online').length} online</span>
        </div>
        <div className="divide-y divide-gray-800/40">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-base">{agent.icon}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                    agent.status === 'online' ? 'bg-green-400' :
                    agent.status === 'idle' ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}></span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{agent.name}</p>
                  <p className="text-gray-500 text-xs">{agent.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-center">
                  <p className="text-white text-sm font-semibold">{agent.tasks}</p>
                  <p className="text-gray-600 text-[10px]">Tasks</p>
                </div>
                <div className="hidden sm:block text-center">
                  <p className="text-green-400 text-sm font-semibold">{agent.success}%</p>
                  <p className="text-gray-600 text-[10px]">Success</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  agent.status === 'online' ? 'bg-green-900/40 text-green-400' :
                  agent.status === 'idle' ? 'bg-yellow-900/40 text-yellow-400' :
                  'bg-gray-800 text-gray-500'
                }`}>{agent.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
