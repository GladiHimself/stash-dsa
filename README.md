# stashDSA 🔥

A personal DSA tracker for Striver's A2Z sheet — track your progress, revise flagged questions, and compete with friends.

Live at: **https://stash-dsa.vercel.app/**

## Features

- 🔐 Multi-user auth (email/password via Supabase)
- 📋 457 questions from Striver's A2Z sheet
- ✅ Mark questions solved with streak tracking
- ⭐ Flag questions for revision
- 📝 Per-question notes
- 📊 Dashboard with activity heatmap, topic progress, daily goal
- 🏆 Friend leaderboard
- ⌨️ Keyboard shortcuts (Space = solved, R = revision, N = notes)
- 📱 Mobile responsive

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL)
- **Deploy:** Vercel
- **CI/CD:** GitHub Actions (lint + build on every PR)

## Local Setup

```bash
git clone https://github.com/GladiHimself/stash-dsa.git
cd stash-dsa
npm install
```

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then:

```bash
npm run dev
```

## Branch Strategy

```
main (production) <- dev (staging) <- feature/xyz
```

All changes go through a PR. CI must pass before merging.

## Contributing

1. Branch off `dev`: `git checkout -b feature/your-feature`
2. Make changes, run `npm run lint`
3. Push and open a PR to `dev`
4. CI passes → merge

## Database Schema

```sql
-- Progress tracking
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id text not null,
  solved_at date,
  is_revision boolean default false,
  notes text default '',
  unique(user_id, question_id)
);

-- Leaderboard usernames
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
);
```

Both tables have RLS enabled — users can only write their own data.