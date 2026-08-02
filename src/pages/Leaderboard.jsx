import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard({ session }) {
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Get current user's username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profile) setUsername(profile.username)

      // Get all progress counts
      const { data: rows } = await supabase
        .from('progress')
        .select('user_id, solved_at')

      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')

      if (rows && profiles) {
        const counts = {}
        rows.forEach(r => {
          if (r.solved_at) counts[r.user_id] = (counts[r.user_id] || 0) + 1
        })
        const ranked = profiles
          .map(p => ({ username: p.username, solved: counts[p.id] || 0, isMe: p.id === session.user.id }))
          .sort((a, b) => b.solved - a.solved)
        setBoard(ranked)
      }
      setLoading(false)
    }
    load()
  }, [session, username])

  async function saveUsername() {
    if (!input.trim()) return
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, username: input.trim() })
    if (error) {
      setError(error.message.includes('unique') ? 'Username taken' : error.message)
    } else {
      setUsername(input.trim())
      setInput('')
    }
    setSaving(false)
  }

  if (!username) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-lg font-semibold text-gray-200 mb-2">Set your username</h2>
        <p className="text-xs text-gray-500 mb-6">Pick a display name to appear on the leaderboard.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. pranav"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveUsername()}
            className="flex-1 bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <button onClick={saveUsername} disabled={saving}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? '...' : 'Join'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">🏆 Leaderboard</h2>
        <span className="text-xs text-gray-500">@{username}</span>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-16 text-sm">Loading...</div>
      ) : (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#30363D]">
            {board.map((entry, i) => (
              <div key={entry.username}
                className={'flex items-center gap-4 px-5 py-4 ' + (entry.isMe ? 'bg-indigo-500/5' : '')}>
                <span className={'text-sm font-bold w-6 text-center ' +
                  (i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-600')}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className={'flex-1 text-sm font-medium ' + (entry.isMe ? 'text-indigo-400' : 'text-gray-200')}>
                  {entry.username} {entry.isMe && <span className="text-xs text-gray-600">(you)</span>}
                </span>
                <span className="text-sm font-semibold text-gray-300">{entry.solved}</span>
                <span className="text-xs text-gray-600">solved</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}