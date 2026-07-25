import { useState } from 'react'
import { TOPICS, QUESTIONS } from '../data/questions'

function ytUrl(title) {
  return 'https://www.youtube.com/results?search_query=striver+' + encodeURIComponent(title)
}

function gfgUrl(title) {
  return 'https://www.geeksforgeeks.org/problems/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '/1'
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']
const STATUSES = ['All', 'Solved', 'Unsolved', 'Revision']

function DiffBadge({ diff }) {
  const colors = {
    Easy: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    Hard: 'text-red-400 bg-red-400/10',
  }
  return (
    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (colors[diff] || '')}>
      {diff}
    </span>
  )
}

function LinkBtn({ href, label, color }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={'text-xs px-2 py-0.5 rounded font-medium ' + color + ' hover:opacity-80 transition-opacity'}>
      {label}
    </a>
  )
}

export default function QuestionsView({ progress, onToggleSolved, onToggleRevision, onSignOut, userEmail }) {
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('All')
  const [diffFilter, setDiffFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const solvedCount = Object.keys(progress.solved).length
  const total = QUESTIONS.length

  const filtered = QUESTIONS.filter((q) => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false
    if (topicFilter !== 'All' && q.topic !== topicFilter) return false
    if (diffFilter !== 'All' && q.difficulty !== diffFilter) return false
    if (statusFilter === 'Solved' && !progress.solved[q.id]) return false
    if (statusFilter === 'Unsolved' && progress.solved[q.id]) return false
    if (statusFilter === 'Revision' && !progress.revision.includes(q.id)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-100">
      <header className="border-b border-[#30363D] sticky top-0 bg-[#0D1117] z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-indigo-400">stashDSA</span>
            <span className="text-sm text-gray-400">
              <span className="text-indigo-400 font-semibold">{solvedCount}</span>
              <span className="text-gray-600"> / </span>
              {total} solved
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{userEmail}</span>
            <button onClick={onSignOut}
              className="text-xs text-gray-400 hover:text-white border border-[#30363D] px-3 py-1.5 rounded-md transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Overall Progress</span>
            <span>{Math.round((solvedCount / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#161B22] rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: (solvedCount / total * 100) + '%' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {TOPICS.map((t) => {
            const topicQs = QUESTIONS.filter((q) => q.topic === t.id)
            const topicSolved = topicQs.filter((q) => progress.solved[q.id]).length
            return (
              <button key={t.id}
                onClick={() => setTopicFilter(topicFilter === t.id ? 'All' : t.id)}
                className={'p-2 rounded-lg border text-left transition-all ' +
                  (topicFilter === t.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-[#30363D] bg-[#161B22] hover:border-[#484F58]')}>
                <div className="text-base mb-1">{t.emoji}</div>
                <div className="text-xs font-medium text-gray-300 leading-tight truncate">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{topicSolved}/{topicQs.length}</div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <input type="text" placeholder="Search questions..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
          <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}
            className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          {(topicFilter !== 'All' || diffFilter !== 'All' || statusFilter !== 'All' || search) && (
            <button onClick={() => { setSearch(''); setTopicFilter('All'); setDiffFilter('All'); setStatusFilter('All') }}
              className="text-xs text-gray-400 hover:text-white px-3 py-2 border border-[#30363D] rounded-lg transition-colors">
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-3">Showing {filtered.length} of {total}</div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-sm">No questions match your filters.</div>
          ) : (
            <div className="divide-y divide-[#30363D]">
              {filtered.map((q) => {
                const isSolved = !!progress.solved[q.id]
                const isRevision = progress.revision.includes(q.id)
                const topic = TOPICS.find((t) => t.id === q.topic)
                const isLC = q.leetcode && q.leetcode.includes('leetcode.com')

                return (
                  <div key={q.id}
                    className={'flex items-center gap-3 px-4 py-3 hover:bg-[#1C2128] transition-colors ' + (isSolved ? 'opacity-60' : '')}>
                    <button onClick={() => onToggleSolved(q.id)}
                      className={'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ' +
                        (isSolved ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-500')}>
                      {isSolved && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className={'text-sm font-medium ' + (isSolved ? 'line-through text-gray-500' : 'text-gray-200')}>
                        {q.title}
                      </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <DiffBadge diff={q.difficulty} />
                      {topic && (
                        <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + topic.color}>
                          {topic.emoji} {topic.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isLC && <LinkBtn href={q.leetcode} label="LC" color="text-yellow-400 bg-yellow-400/10" />}
                      <LinkBtn href={gfgUrl(q.title)} label="GFG" color="text-green-400 bg-green-400/10" />
                      <LinkBtn href={ytUrl(q.title)} label="YT" color="text-red-400 bg-red-400/10" />
                      {topic && topic.tuf && <LinkBtn href={topic.tuf} label="TUF" color="text-blue-400 bg-blue-400/10" />}
                    </div>

                    <button onClick={() => onToggleRevision(q.id)}
                      className={'flex-shrink-0 text-lg leading-none transition-colors ' +
                        (isRevision ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400')}>
                      ★
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}