import { useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Supabase connected:', data, error)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <h1 className="text-2xl font-bold text-indigo-400">stashDSA 🔥</h1>
    </div>
  )
}

export default App