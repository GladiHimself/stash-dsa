import { useState } from 'react'

function getRing(pct) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return { circ, offset }
}

export default function DailyGoal({ progress }) {
  const saved = parseInt(localStorage.getItem('dailyGoal') || '5', 10)
  const [goal, setGoal] = useState(saved)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(saved))

  const today = new Date().toISOString().split('T')[0]
  const solvedToday = Object.values(progress.solved).filter(d => d === today).length

  const pct = goal > 0 ? Math.round((solvedToday / goal) * 100) : 0
  const { circ, offset } = getRing(pct)

  const message =
    solvedToday === 0 ? "Let's get started! 💪" :
    pct < 50 ? 'Keep going! 🔥' :
    pct < 100 ? 'Almost there! ⚡' :
    "Goal crushed! 🎉"

  function saveGoal() {
    const n = Math.max(1, parseInt(input, 10) || 1)
    setGoal(n)
    localStorage.setItem('dailyGoal', String(n))
    setEditing(false)
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-300">Daily Goal</h2>
        <button onClick={() => { setEditing(e => !e); setInput(String(goal)) }}
          className="text-xs text-gray-500 hover:text-white transition-colors">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mb-4">
          <input
            type="number" min="1" max="50"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-20 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
          />
          <button onClick={saveGoal}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            Save
          </button>
        </div>
      )}

      <div className="flex items-center gap-6">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#0D1117" strokeWidth="12" />
          <circle cx="64" cy="64" r="54" fill="none" stroke="#6366F1" strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          <text x="64" y="60" textAnchor="middle" fill="#E5E7EB" fontSize="22" fontWeight="bold">
            {solvedToday}/{goal}
          </text>
          <text x="64" y="80" textAnchor="middle" fill="#6B7280" fontSize="11">
            today
          </text>
        </svg>
        <div>
          <p className="text-lg font-semibold text-gray-200">{pct}% done</p>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
          <p className="text-xs text-gray-600 mt-3">
            {goal - solvedToday > 0
              ? (goal - solvedToday) + ' more to reach your goal'
              : 'Goal complete for today!'}
          </p>
        </div>
      </div>
    </div>
  )
}