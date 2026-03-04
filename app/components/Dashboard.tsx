'use client'

import { useState, useEffect } from 'react'

const agents = [
  { id: 1, name: 'Sales Agent', status: 'online', tasks: 12, success: 95, model: 'Gemini Pro' },
  { id: 2, name: 'Support Agent', status: 'online', tasks: 8, success: 88, model: 'Gemini Pro' },
  { id: 3, name: 'Data Agent', status: 'idle', tasks: 3, success: 100, model: 'Gemini Pro' },
  { id: 4, name: 'Report Agent', status: 'offline', tasks: 0, success: 72, model: 'Gemini Pro' },
]

const stats = [
  { label: 'Agents Online', value: '3/4', icon: '🤖', color: 'text-green-400' },
  { label: 'Tasks Today', value: '23', icon: '📋', color: 'text-blue-400' },
  { label: 'Success Rate', value: '92%', icon: '✅', color: 'text-purple-400' },
  { label: 'API Calls', value: '1,247', icon: '⚡', color: 'text-yellow-400' },
]

export default function Dashboard() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">Last updated: {time.toLocaleTimeString('th-TH')}</p>
        <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-full">● Live</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Agents Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Agent Status</h2>
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  agent.status === 'online' ? 'bg-green-400 animate-pulse' :
                  agent.status === 'idle' ? 'bg-yellow-400' : 'bg-gray-600'
                }`}></span>
                <div>
                  <p className="text-white text-sm font-medium">{agent.name}</p>
                  <p className="text-gray-500 text-xs">{agent.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-white font-medium">{agent.tasks}</p>
                  <p className="text-gray-500 text-xs">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-medium">{agent.success}%</p>
                  <p className="text-gray-500 text-xs">Success</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  agent.status === 'online' ? 'bg-green-900/50 text-green-400' :
                  agent.status === 'idle' ? 'bg-yellow-900/50 text-yellow-400' :
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
