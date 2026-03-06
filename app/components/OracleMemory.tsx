'use client'

import { useState, useEffect } from 'react'

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || 'http://localhost:47778'

interface SearchResult {
  id: string
  title: string
  content: string
  score?: number
  tags?: string[]
}

interface OracleStats {
  total_documents?: number
  total_searches?: number
  db_size?: string
}

export default function OracleMemory() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [stats, setStats] = useState<OracleStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [learnText, setLearnText] = useState('')
  const [learnTitle, setLearnTitle] = useState('')
  const [learnLoading, setLearnLoading] = useState(false)
  const [learnMsg, setLearnMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'search' | 'learn' | 'reflect'>('search')
  const [reflection, setReflection] = useState('')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/oracle/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setConnected(true)
      }
    } catch {
      setConnected(false)
    }
  }

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await fetch(`/api/oracle/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || data || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const learn = async () => {
    if (!learnText.trim()) return
    setLearnLoading(true)
    setLearnMsg('')
    try {
      const res = await fetch('/api/oracle/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: learnTitle || 'Untitled', content: learnText }),
      })
      if (res.ok) {
        setLearnMsg('บันทึกสำเร็จแล้ว')
        setLearnText('')
        setLearnTitle('')
        fetchStats()
      } else {
        setLearnMsg('เกิดข้อผิดพลาด')
      }
    } catch {
      setLearnMsg('ไม่สามารถเชื่อมต่อ Oracle ได้')
    } finally {
      setLearnLoading(false)
    }
  }

  const reflect = async () => {
    setLoading(true)
    setReflection('')
    try {
      const res = await fetch('/api/oracle/reflect')
      const data = await res.json()
      setReflection(data.content || data.wisdom || JSON.stringify(data))
    } catch {
      setReflection('ไม่สามารถเชื่อมต่อ Oracle ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
          <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
            Oracle {connected ? 'Connected' : 'Offline - รัน: bun run server ที่ oracle-v2 ก่อน'}
          </span>
        </div>
        {stats && (
          <div className="flex gap-4 text-xs text-gray-500">
            <span>{stats.total_documents?.toLocaleString() || '—'} documents</span>
            <span>{stats.total_searches?.toLocaleString() || '—'} searches</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {(['search', 'learn', 'reflect'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'search' ? '🔍 ค้นหา' : tab === 'learn' ? '📝 สอน Oracle' : '🔮 Reflect'}
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="ค้นหาใน Oracle memory..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={search}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
            >
              {loading ? '...' : 'ค้นหา'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{r.title || `Result ${i + 1}`}</h3>
                    {r.score !== undefined && (
                      <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">
                        {(r.score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-3">{r.content}</p>
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {r.tags.map((tag, j) => (
                        <span key={j} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loading && results.length === 0 && query && (
            <p className="text-gray-600 text-sm text-center py-8">ไม่พบผลลัพธ์</p>
          )}
        </div>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">สอนความรู้ใหม่ให้ Oracle</h2>
            <div className="space-y-3">
              <input
                value={learnTitle}
                onChange={e => setLearnTitle(e.target.value)}
                placeholder="หัวข้อ..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                value={learnText}
                onChange={e => setLearnText(e.target.value)}
                placeholder="เนื้อหา/ความรู้ที่ต้องการบันทึก..."
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={learn}
                  disabled={learnLoading || !learnText.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                >
                  {learnLoading ? 'กำลังบันทึก...' : '💾 บันทึก'}
                </button>
                {learnMsg && <span className={`text-sm ${learnMsg.includes('สำเร็จ') ? 'text-green-400' : 'text-red-400'}`}>{learnMsg}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflect Tab */}
      {activeTab === 'reflect' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-2">Oracle Wisdom</h2>
            <p className="text-gray-500 text-xs mb-4">ดึงความรู้สุ่มจาก Oracle memory</p>
            <button
              onClick={reflect}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium mb-4"
            >
              {loading ? '...' : '🔮 Reflect'}
            </button>
            {reflection && (
              <div className="bg-gray-800/50 border border-purple-900/50 rounded-xl p-4">
                <p className="text-gray-200 text-sm whitespace-pre-wrap">{reflection}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
