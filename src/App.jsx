import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import QuestionsView from './pages/QuestionsView'

const INITIAL_PROGRESS = { solved: {}, revision: [] }

function App() {
  const [session, setSession] = useState(undefined)
  const [view, setView] = useState('questions')
  const [progress, setProgress] = useState(INITIAL_PROGRESS)
  const [loading, setLoading] = useState(true)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load progress from Supabase when session starts
  useEffect(() => {
  async function loadProgress() {
    if (!session) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('progress').select('*').eq('user_id', session.user.id)
    if (!error && data) {
      const solved = {}
      const revision = []
      data.forEach(row => {
        if (row.solved_at) solved[row.question_id] = row.solved_at
        if (row.is_revision) revision.push(row.question_id)
      })
      setProgress({ solved, revision })
    }
    setLoading(false)
  }
  loadProgress()
}, [session])

  async function onToggleSolved(questionId) {
    const isSolved = !!progress.solved[questionId]

    if (isSolved) {
      // Remove solved
      setProgress(p => {
        const newSolved = { ...p.solved }
        delete newSolved[questionId]
        return { ...p, solved: newSolved }
      })
      await supabase
        .from('progress')
        .update({ solved_at: null })
        .eq('user_id', session.user.id)
        .eq('question_id', questionId)
    } else {
      // Mark solved
      const today = new Date().toISOString().split('T')[0]
      setProgress(p => ({ ...p, solved: { ...p.solved, [questionId]: today } }))
      await supabase
        .from('progress')
        .upsert({
          user_id: session.user.id,
          question_id: questionId,
          solved_at: today,
        })
    }
  }

  async function onToggleRevision(questionId) {
    const isRevision = progress.revision.includes(questionId)

    if (isRevision) {
      setProgress(p => ({ ...p, revision: p.revision.filter(id => id !== questionId) }))
      await supabase
        .from('progress')
        .update({ is_revision: false })
        .eq('user_id', session.user.id)
        .eq('question_id', questionId)
    } else {
      setProgress(p => ({ ...p, revision: [...p.revision, questionId] }))
      await supabase
        .from('progress')
        .upsert({
          user_id: session.user.id,
          question_id: questionId,
          solved_at: progress.solved[questionId] || new Date().toISOString().split('T')[0],
          is_revision: true,
        })
    }
  }

  if (session === undefined || loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) return <AuthPage />

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Header */}
      <header className="border-b border-[#30363D] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400">stashDSA 🔥</h1>
        <nav className="flex gap-6">
          <button
            onClick={() => setView('questions')}
            className={`text-sm font-medium transition-colors ${view === 'questions' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Questions
          </button>
          <button
            onClick={() => setView('dashboard')}
            className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Dashboard
          </button>
        </nav>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Views */}
      {view === 'questions' && (
        <QuestionsView
          progress={progress}
          onToggleSolved={onToggleSolved}
          onToggleRevision={onToggleRevision}
        />
      )}
      {view === 'dashboard' && (
        <div className="p-6 text-gray-500">Dashboard coming Day 3</div>
      )}
    </div>
  )
}

export default App