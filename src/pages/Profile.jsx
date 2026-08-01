import { QUESTIONS } from '../data/questions'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
      <div className={'text-2xl font-bold ' + (color || 'text-white')}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  )
}

function DiffBar({ label, solved, total, color }) {
  const pct = total ? Math.round((solved / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={color}>{label}</span>
        <span className="text-gray-500">{solved}/{total} · {pct}%</span>
      </div>
      <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
        <div className={'h-full rounded-full transition-all duration-500 ' +
          (label === 'Easy' ? 'bg-green-500' : label === 'Medium' ? 'bg-yellow-500' : 'bg-red-500')}
          style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

export default function Profile({ progress, session }) {
  const solvedCount = Object.keys(progress.solved).length
  const total = QUESTIONS.length
  const revisionCount = progress.revision.length
  const notesCount = Object.keys(progress.notes || {}).length

  const easySolved = QUESTIONS.filter(q => q.difficulty === 'Easy' && progress.solved[q.id]).length
  const mediumSolved = QUESTIONS.filter(q => q.difficulty === 'Medium' && progress.solved[q.id]).length
  const hardSolved = QUESTIONS.filter(q => q.difficulty === 'Hard' && progress.solved[q.id]).length
  const easyTotal = QUESTIONS.filter(q => q.difficulty === 'Easy').length
  const mediumTotal = QUESTIONS.filter(q => q.difficulty === 'Medium').length
  const hardTotal = QUESTIONS.filter(q => q.difficulty === 'Hard').length

  const joinDate = new Date(session.user.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const solvedDates = Object.values(progress.solved).sort()
  const firstSolve = solvedDates[0]
  const lastSolve = solvedDates[solvedDates.length - 1]

  function downloadCard() {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0D1117'
    ctx.fillRect(0, 0, 800, 400)

    ctx.strokeStyle = '#30363D'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, 798, 398)

    ctx.fillStyle = '#818CF8'
    ctx.font = 'bold 32px monospace'
    ctx.fillText('stashDSA', 40, 60)

    ctx.fillStyle = '#6B7280'
    ctx.font = '16px monospace'
    ctx.fillText(session.user.email, 40, 95)

    ctx.strokeStyle = '#30363D'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 115)
    ctx.lineTo(760, 115)
    ctx.stroke()

    const stats = [
      { label: 'Solved', value: solvedCount + '/' + total, color: '#818CF8' },
      { label: 'Completion', value: Math.round((solvedCount / total) * 100) + '%', color: '#34D399' },
      { label: 'Easy', value: easySolved + '/' + easyTotal, color: '#34D399' },
      { label: 'Medium', value: mediumSolved + '/' + mediumTotal, color: '#FBBF24' },
      { label: 'Hard', value: hardSolved + '/' + hardTotal, color: '#F87171' },
      { label: 'Revision', value: String(revisionCount), color: '#FBBF24' },
    ]

    stats.forEach((s, i) => {
      const x = 40 + (i % 3) * 250
      const y = i < 3 ? 170 : 280
      ctx.fillStyle = s.color
      ctx.font = 'bold 28px monospace'
      ctx.fillText(s.value, x, y)
      ctx.fillStyle = '#6B7280'
      ctx.font = '14px monospace'
      ctx.fillText(s.label, x, y + 24)
    })

    ctx.fillStyle = '#374151'
    ctx.font = '13px monospace'
    ctx.fillText('stash-dsa.vercel.app · ' + new Date().toLocaleDateString(), 40, 370)

    const link = document.createElement('a')
    link.download = 'stashDSA-progress.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Avatar + info */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-2xl">
          {session.user.email[0].toUpperCase()}
        </div>
        <div>
          <div className="text-base font-semibold text-gray-200">{session.user.email}</div>
          <div className="text-xs text-gray-500 mt-1">Joined {joinDate}</div>
          {firstSolve && (
            <div className="text-xs text-gray-600 mt-0.5">
              First solve: {firstSolve} · Last solve: {lastSolve}
            </div>
          )}
        </div>
        <div className="ml-auto">
          <button
            onClick={downloadCard}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Download Progress Card
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Solved" value={solvedCount} sub={'of ' + total} color="text-indigo-400" />
        <StatCard label="Completion" value={Math.round((solvedCount / total) * 100) + '%'} color="text-green-400" />
        <StatCard label="Revision Flagged" value={revisionCount} color="text-yellow-400" />
        <StatCard label="Notes Written" value={notesCount} color="text-blue-400" />
      </div>

      {/* Difficulty breakdown */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">Difficulty Breakdown</h2>
        <DiffBar label="Easy" solved={easySolved} total={easyTotal} color="text-green-400" />
        <DiffBar label="Medium" solved={mediumSolved} total={mediumTotal} color="text-yellow-400" />
        <DiffBar label="Hard" solved={hardSolved} total={hardTotal} color="text-red-400" />
      </div>
    </div>
  )
}