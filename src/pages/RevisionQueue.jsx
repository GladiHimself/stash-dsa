import { useState } from 'react'
import { TOPICS, QUESTIONS } from '../data/questions'

function ytUrl(title) {
  return 'https://www.youtube.com/results?search_query=striver+' + encodeURIComponent(title)
}

function gfgUrl(title) {
  return 'https://www.google.com/search?q=geeksforgeeks+' + encodeURIComponent(title)
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

export default function RevisionQueue({ progress, onToggleSolved, onToggleRevision, onSaveNote }) {
  const [noteModal, setNoteModal] = useState(null)
  const revisionQuestions = QUESTIONS.filter(q => progress.revision.includes(q.id))

  if (revisionQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">⭐</div>
        <p className="text-gray-400 text-sm">No questions flagged for revision yet.</p>
        <p className="text-gray-600 text-xs mt-2">Click the ★ on any question to add it here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">Revision Queue</h2>
        <span className="text-xs text-gray-500">{revisionQuestions.length} questions</span>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="divide-y divide-[#30363D]">
          {revisionQuestions.map(q => {
            const isSolved = !!progress.solved[q.id]
            const topic = TOPICS.find(t => t.id === q.topic)
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
                  <span className={'text-sm font-medium truncate block ' + (isSolved ? 'line-through text-gray-500' : 'text-gray-200')}>
                    {q.title}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  {topic && (
                    <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + topic.color}>
                      {topic.emoji} {topic.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isLC && <LinkBtn href={q.leetcode} label="LC" color="text-yellow-400 bg-yellow-400/10" />}
                  <LinkBtn href={ytUrl(q.title)} label="YT" color="text-red-400 bg-red-400/10" />
                  <span className="hidden sm:flex items-center gap-1.5">
                    <LinkBtn href={gfgUrl(q.title)} label="GFG" color="text-green-400 bg-green-400/10" />
                    {topic && topic.tuf && <LinkBtn href={topic.tuf} label="TUF" color="text-blue-400 bg-blue-400/10" />}
                  </span>
                </div>

                <button onClick={() => onToggleRevision(q.id)}
                  className="flex-shrink-0 text-lg leading-none text-yellow-400 hover:text-gray-600 transition-colors"
                  title="Remove from revision">
                  ★
                </button>

                <button
                  onClick={() => setNoteModal({ id: q.id, title: q.title, note: progress.notes?.[q.id] || '' })}
                  className={'flex-shrink-0 text-sm transition-colors ' +
                    (progress.notes?.[q.id] ? 'text-indigo-400' : 'text-gray-700 hover:text-indigo-400')}
                  title="Notes">
                  📝
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setNoteModal(null)}>
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-200 mb-1">{noteModal.title}</h3>
            <p className="text-xs text-gray-500 mb-3">Notes</p>
            <textarea
              autoFocus
              rows={5}
              value={noteModal.note}
              onChange={(e) => setNoteModal((m) => ({ ...m, note: e.target.value }))}
              placeholder="Write your notes here..."
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setNoteModal(null)}
                className="text-xs text-gray-500 hover:text-white px-3 py-1.5 border border-[#30363D] rounded-md transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => { await onSaveNote(noteModal.id, noteModal.note); setNoteModal(null) }}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}