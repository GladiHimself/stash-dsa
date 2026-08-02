import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import QuestionsView from "./pages/QuestionsView";
import Dashboard from "./pages/Dashboard";
import RevisionQueue from "./pages/RevisionQueue";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

const INITIAL_PROGRESS = { solved: {}, revision: [], notes: {} };

function App() {
  const [session, setSession] = useState(undefined);
  const [view, setView] = useState("questions");
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load progress from Supabase when session starts
  useEffect(() => {
    async function loadProgress() {
      if (!session) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", session.user.id);
      if (!error && data) {
        const solved = {};
        const revision = [];
        const notes = {};
        data.forEach((row) => {
          if (row.solved_at) solved[row.question_id] = row.solved_at;
          if (row.is_revision) revision.push(row.question_id);
          if (row.notes) notes[row.question_id] = row.notes;
        });
        setProgress({ solved, revision, notes });
      }
      setLoading(false);
    }
    loadProgress();
  }, [session]);

  async function onToggleSolved(questionId) {
    const isSolved = !!progress.solved[questionId];

    if (isSolved) {
      // Remove solved
      setProgress((p) => {
        const newSolved = { ...p.solved };
        delete newSolved[questionId];
        return { ...p, solved: newSolved };
      });
      await supabase
        .from("progress")
        .update({ solved_at: null })
        .eq("user_id", session.user.id)
        .eq("question_id", questionId);
    } else {
      // Mark solved
      const today = new Date().toISOString().split("T")[0];
      setProgress((p) => ({
        ...p,
        solved: { ...p.solved, [questionId]: today },
      }));
      await supabase.from("progress").upsert({
        user_id: session.user.id,
        question_id: questionId,
        solved_at: today,
      });
    }
  }

  async function onToggleRevision(questionId) {
    const isRevision = progress.revision.includes(questionId);

    if (isRevision) {
      setProgress((p) => ({
        ...p,
        revision: p.revision.filter((id) => id !== questionId),
      }));
      await supabase
        .from("progress")
        .update({ is_revision: false })
        .eq("user_id", session.user.id)
        .eq("question_id", questionId);
    } else {
      setProgress((p) => ({ ...p, revision: [...p.revision, questionId] }));
      await supabase.from("progress").upsert({
        user_id: session.user.id,
        question_id: questionId,
        solved_at:
          progress.solved[questionId] || new Date().toISOString().split("T")[0],
        is_revision: true,
      });
    }
  }

  async function onSaveNote(questionId, note) {
    const { data: existing } = await supabase
      .from("progress")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("question_id", questionId)
      .single();

    if (existing) {
      await supabase
        .from("progress")
        .update({ notes: note })
        .eq("user_id", session.user.id)
        .eq("question_id", questionId);
    } else {
      await supabase.from("progress").insert({
        user_id: session.user.id,
        question_id: questionId,
        solved_at: new Date().toISOString().split("T")[0],
        notes: note,
      });
    }

    setProgress((p) => ({ ...p, notes: { ...p.notes, [questionId]: note } }));
  }

  if (session === undefined || loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Header */}
      <header className="border-b border-[#30363D] px-6 py-4 flex items-center justify-between">
        <h1 className="text-base sm:text-xl font-bold text-indigo-400">
          stashDSA 🔥
        </h1>
        <nav className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setView("questions")}
            className={`text-sm font-medium transition-colors ${view === "questions" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Questions
          </button>
          <button
            onClick={() => setView("dashboard")}
            className={`text-sm font-medium transition-colors ${view === "dashboard" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("revision")}
            className={`text-sm font-medium transition-colors ${view === "revision" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Revision ⭐
          </button>
          <button
            onClick={() => setView("profile")}
            className={`text-sm font-medium transition-colors ${view === "profile" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Profile
          </button>
          <button
            onClick={() => setView("leaderboard")}
            className={`text-sm font-medium transition-colors ${view === "leaderboard" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            🏆
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
      {view === "questions" && (
        <QuestionsView
          progress={progress}
          onToggleSolved={onToggleSolved}
          onToggleRevision={onToggleRevision}
          onSaveNote={onSaveNote}
        />
      )}
      {view === "dashboard" && <Dashboard progress={progress} />}
      {view === "revision" && (
        <RevisionQueue
          progress={progress}
          onToggleSolved={onToggleSolved}
          onToggleRevision={onToggleRevision}
          onSaveNote={onSaveNote}
        />
      )}
      {view === "profile" && <Profile progress={progress} session={session} />}
      {view === "leaderboard" && <Leaderboard session={session} />}
    </div>
  );
}

export default App;
