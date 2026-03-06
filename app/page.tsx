'use client'

import { useState } from 'react'
import ChatPage from './components/ChatPage'
import Dashboard from './components/Dashboard'
import TaskManager from './components/TaskManager'
import Monitor from './components/Monitor'
import MultiAgent from './components/MultiAgent'
import OracleMemory from './components/OracleMemory'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'chat', label: 'AI Agent', icon: '🤖' },
  { id: 'tasks', label: 'Task Manager', icon: '📋' },
  { id: 'monitor', label: 'Monitor', icon: '📡' },
  { id: 'agents', label: 'Multi-Agent', icon: '🧠' },
  { id: 'oracle', label: 'Oracle Memory', icon: '🔮' },
]

export default function Home() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          {sidebarOpen && <span className="text-white font-bold text-lg">OpenClaw</span>}
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 text-gray-500 hover:text-white border-t border-gray-800 text-sm"
        >
          {sidebarOpen ? '◀ ซ่อน' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">
            {navItems.find(n => n.id === active)?.icon} {navItems.find(n => n.id === active)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm">Mission Control Online</span>
          </div>
        </header>

        <div className="p-6">
          {active === 'dashboard' && <Dashboard />}
          {active === 'chat' && <ChatPage />}
          {active === 'tasks' && <TaskManager />}
          {active === 'monitor' && <Monitor />}
          {active === 'agents' && <MultiAgent />}
          {active === 'oracle' && <OracleMemory />}
        </div>
      </main>
    </div>
  )
}
