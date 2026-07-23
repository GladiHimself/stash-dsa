import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Get session on initial load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still loading
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Not logged in
  if (!session) return <AuthPage />

  // Logged in
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-indigo-400">stashDSA 🔥</h1>
        <p className="text-gray-400 mt-2">Welcome, {session.user.email}</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 text-sm text-red-400 hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default App