'use client'

import { useState, useEffect, useCallback } from 'react'
import ChatPage from './components/ChatPage'
import Dashboard from './components/Dashboard'
import TaskManager from './components/TaskManager'
import Monitor from './components/Monitor'
import MultiAgent from './components/MultiAgent'
import OracleMemory from './components/OracleMemory'
import NotificationPanel from './components/NotificationPanel'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'chat', label: 'AI Agent', icon: '🤖' },
  { id: 'tasks', label: 'Task Manager', icon: '📋' },
  { id: 'monitor', label: 'Monitor', icon: '📡' },
  { id: 'agents', label: 'Multi-Agent', icon: '🧠' },
  { id: 'oracle', label: 'Oracle Memory', icon: '🔮' },
]

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  time: string
  read: boolean
}

export default function Home() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Mission Control Online', message: 'ระบบพร้อมใช้งานแล้ว', type: 'success', time: 'เพิ่งเกิดขึ้น', read: false },
    { id: 2, title: 'Gemini AI Connected', message: 'เชื่อมต่อ Gemini API สำเร็จ', type: 'info', time: '1 นาทีที่แล้ว', read: false },
  ])
  const [showNotif, setShowNotif] = useState(false)

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'read'>) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), read: false }, ...prev.slice(0, 19)])
  }, [])

  // Simulate real-time notifications
  useEffect(() => {
    const msgs = [
      { title: 'Task Completed', message: 'Sales Agent เสร็จงาน: วิเคราะห์ยอดขาย', type: 'success' as const },
      { title: 'Agent Warning', message: 'Support Agent response time สูง', type: 'warning' as const },
      { title: 'New Data', message: 'ดึงข้อมูลใหม่ 247 records', type: 'info' as const },
    ]
    const timer = setInterval(() => {
      const msg = msgs[Math.floor(Math.random() * msgs.length)]
      addNotification({ ...msg, time: 'เพิ่งเกิดขึ้น' })
    }, 30000)
    return () => clearInterval(timer)
  }, [addNotification])

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const navigate = (id: string) => {
    setActive(id)
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-30 h-full lg:h-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'w-56' : 'w-16'}
        transition-all duration-300 bg-gray-900 border-r border-gray-800/60 flex flex-col shadow-2xl
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800/60 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-lg shrink-0">🦞</div>
          {sidebarOpen && (
            <div>
              <p className="text-white font-bold text-sm">OpenClaw</p>
              <p className="text-gray-500 text-xs">Mission Control</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active === item.id
                  ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-900/30'
                  : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {active === item.id && sidebarOpen && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex p-4 text-gray-600 hover:text-gray-300 border-t border-gray-800/60 text-xs items-center gap-2 transition-colors"
        >
          <span>{sidebarOpen ? '◀' : '▶'}</span>
          {sidebarOpen && <span>ซ่อน Sidebar</span>}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-gray-900/80 backdrop-blur border-b border-gray-800/60 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              ☰
            </button>
            <div>
              <h1 className="text-white font-semibold text-sm">
                {navItems.find(n => n.id === active)?.icon}{' '}
                {navItems.find(n => n.id === active)?.label}
              </h1>
              <p className="text-gray-600 text-xs hidden sm:block">OpenClaw Mission Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs">Online</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setShowNotif(false)}
                  onMarkAllRead={markAllRead}
                />
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {active === 'dashboard' && <Dashboard addNotification={addNotification} />}
          {active === 'chat' && <ChatPage />}
          {active === 'tasks' && <TaskManager addNotification={addNotification} />}
          {active === 'monitor' && <Monitor />}
          {active === 'agents' && <MultiAgent />}
          {active === 'oracle' && <OracleMemory />}
        </div>
      </main>
    </div>
  )
}
