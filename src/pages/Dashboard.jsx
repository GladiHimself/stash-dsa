import { TOPICS, QUESTIONS } from '../data/questions'
import DailyGoal from './DailyGoal'

function getStreak(solved) {
  const dates = [...new Set(Object.values(solved))].sort()
  if (dates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // streak only counts if solved today or yesterday
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0

  let streak = 0
  let check = dates.includes(today) ? today : yesterday

  while (dates.includes(check)) {
    streak++
    const prev = new Date(new Date(check).getTime() - 86400000)
    check = prev.toISOString().split('T')[0]
  }
  return streak
}

function getHeatmapData(solved) {
  const counts = {}
  Object.values(solved).forEach(date => {
    counts[date] = (counts[date] || 0) + 1
  })
  return counts
}

function HeatmapCell({ count }) {
  const color =
    count === 0 ? 'bg-[#161B22]' :
    count === 1 ? 'bg-green-900' :
    count === 2 ? 'bg-green-700' :
    count === 3 ? 'bg-green-500' :
    'bg-green-400'
  return (
    <div title={count + ' solved'} className={'w-3 h-3 rounded-sm ' + color} />
  )
}

function Heatmap({ solved }) {
  const counts = getHeatmapData(solved)

  // Build last 52 weeks of days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - 363) // ~52 weeks back
  // align to Sunday
  startDay.setDate(startDay.getDate() - startDay.getDay())

  const weeks = []
  const cursor = new Date(startDay)
  while (cursor <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split('T')[0]
      week.push({ date: dateStr, count: counts[dateStr] || 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['S','M','T','W','T','F','S']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-1 ml-6">
        {weeks.map((week, wi) => {
          const firstDay = new Date(week[0].date)
          const showMonth = firstDay.getDate() <= 7
          return (
            <div key={wi} className="w-3 text-center">
              {showMonth && (
                <span className="text-[9px] text-gray-600">{months[firstDay.getMonth()]}</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {days.map((d, i) => (
            <div key={i} className="w-4 h-3 flex items-center justify-center">
              <span className="text-[9px] text-gray-600">{i % 2 === 1 ? d : ''}</span>
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <HeatmapCell key={day.date} count={day.count} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ progress }) {
  const solvedCount = Object.keys(progress.solved).length
  const total = QUESTIONS.length
  const streak = getStreak(progress.solved)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <DailyGoal progress={progress} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-indigo-400">{solvedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Questions Solved</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-orange-400">{streak}</div>
          <div className="text-xs text-gray-500 mt-1">Day Streak 🔥</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-green-400">
            {Math.round((solvedCount / total) * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Completion</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Activity</h2>
        <Heatmap solved={progress.solved} />
      </div>

      {/* Topic progress */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Topic Progress</h2>
        <div className="space-y-3">
          {TOPICS.map(t => {
            const topicQs = QUESTIONS.filter(q => q.topic === t.id)
            const topicSolved = topicQs.filter(q => progress.solved[q.id]).length
            const pct = topicQs.length ? Math.round((topicSolved / topicQs.length) * 100) : 0
            return (
              <div key={t.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{t.emoji} {t.name}</span>
                  <span className="text-gray-500">{topicSolved}/{topicQs.length}</span>
                </div>
                <div className="h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: pct + '%' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}