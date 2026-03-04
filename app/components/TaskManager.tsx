'use client'

import { useState } from 'react'

type Priority = 'high' | 'medium' | 'low'
type Status = 'pending' | 'running' | 'done' | 'failed'

interface Task {
  id: number
  title: string
  agent: string
  priority: Priority
  status: Status
  created: string
}

const initialTasks: Task[] = [
  { id: 1, title: 'วิเคราะห์ยอดขายเดือนนี้', agent: 'Sales Agent', priority: 'high', status: 'done', created: '09:00' },
  { id: 2, title: 'สร้างรายงาน Q1', agent: 'Report Agent', priority: 'high', status: 'running', created: '10:30' },
  { id: 3, title: 'ตอบคำถามลูกค้า', agent: 'Support Agent', priority: 'medium', status: 'pending', created: '11:00' },
  { id: 4, title: 'ดึงข้อมูลจาก Google Sheet', agent: 'Data Agent', priority: 'low', status: 'done', created: '11:30' },
  { id: 5, title: 'ส่ง Email สรุปผล', agent: 'Sales Agent', priority: 'medium', status: 'failed', created: '12:00' },
]

const priorityColor: Record<Priority, string> = {
  high: 'bg-red-900/50 text-red-400',
  medium: 'bg-yellow-900/50 text-yellow-400',
  low: 'bg-gray-800 text-gray-400',
}

const statusColor: Record<Status, string> = {
  pending: 'bg-gray-800 text-gray-400',
  running: 'bg-blue-900/50 text-blue-400',
  done: 'bg-green-900/50 text-green-400',
  failed: 'bg-red-900/50 text-red-400',
}

const statusIcon: Record<Status, string> = {
  pending: '⏳',
  running: '🔄',
  done: '✅',
  failed: '❌',
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [agent, setAgent] = useState('Sales Agent')
  const [priority, setPriority] = useState<Priority>('medium')

  const addTask = () => {
    if (!newTask.trim()) return
    const task: Task = {
      id: Date.now(),
      title: newTask,
      agent,
      priority,
      status: 'pending',
      created: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    }
    setTasks(prev => [task, ...prev])
    setNewTask('')
  }

  const deleteTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id))

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    done: tasks.filter(t => t.status === 'done').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(['pending', 'running', 'done', 'failed'] as Status[]).map(s => (
          <div key={s} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl">{statusIcon[s]}</div>
            <div className="text-2xl font-bold text-white mt-1">{counts[s]}</div>
            <div className="text-gray-500 text-xs capitalize mt-1">{s}</div>
          </div>
        ))}
      </div>

      {/* Add Task */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">เพิ่ม Task ใหม่</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="ชื่อ task..."
            className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={agent}
            onChange={e => setAgent(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
          >
            {['Sales Agent', 'Support Agent', 'Data Agent', 'Report Agent'].map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={addTask}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            + เพิ่ม
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Tasks ทั้งหมด</h2>
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span>{statusIcon[task.status]}</span>
                <div>
                  <p className="text-white text-sm">{task.title}</p>
                  <p className="text-gray-500 text-xs">{task.agent} · {task.created}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}>{task.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[task.status]}`}>{task.status}</span>
                <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400 ml-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
