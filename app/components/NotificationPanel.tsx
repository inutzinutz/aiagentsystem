'use client'

import { useEffect, useRef } from 'react'
import type { Notification } from '../page'

interface Props {
  notifications: Notification[]
  onClose: () => void
  onMarkAllRead: () => void
}

const typeIcon: Record<string, string> = {
  success: '✅',
  info: '💡',
  warning: '⚠️',
  error: '❌',
}

const typeBg: Record<string, string> = {
  success: 'border-l-green-500',
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
  error: 'border-l-red-500',
}

export default function NotificationPanel({ notifications, onClose, onMarkAllRead }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-semibold text-sm">การแจ้งเตือน</h3>
        <button onClick={onMarkAllRead} className="text-purple-400 hover:text-purple-300 text-xs">
          อ่านทั้งหมด
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">ไม่มีการแจ้งเตือน</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-gray-800/50 border-l-2 ${typeBg[n.type]} ${
                !n.read ? 'bg-gray-800/30' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5">{typeIcon[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-xs font-medium truncate">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0"></span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-gray-600 text-[10px] mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
