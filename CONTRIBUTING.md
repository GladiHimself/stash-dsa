# Contributing to stashDSA 🔥

Thanks for your interest in contributing! This is an open project — whether you want to fix a bug, suggest a feature, or build something new, you're welcome here.

## Ways to Contribute

### 1. Suggest an idea
Open a [GitHub Issue](https://github.com/GladiHimself/stash-dsa/issues) and describe your idea. No code needed — just explain what you'd like to see and why it would be useful.

### 2. Report a bug
Found something broken? Open an Issue with:
- What you were doing
- What you expected to happen
- What actually happened

### 3. Submit code
Want to build something? Follow the steps below.

---

## Setup

```bash
git clone https://github.com/GladiHimself/stash-dsa.git
cd stash-dsa
npm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get the Supabase keys by messaging the maintainer or creating your own free Supabase project at supabase.com.

```bash
npm run dev
```

---

## Branch Strategy

```
main (production) <- dev (staging) <- feature/your-feature
```

Always branch off `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature
```

---

## Submitting a PR

1. Make your changes
2. Run `npm run lint` — fix any errors before submitting
3. Push your branch and open a PR to `dev` (not `main`)
4. Write a clear title and description of what you built
5. The maintainer will review and merge if it fits the project

---

## Good First Ideas

Looking for inspiration? Here are some things that would make stashDSA better:

- 🌙 Light/dark theme toggle
- 📅 Study schedule planner
- 🔔 Browser notifications for daily goal reminders
- 📈 Weekly progress chart
- 🏷️ Custom tags per question
- 🔍 Filter by notes (questions that have notes)
- 📤 Export progress as CSV

---

## Code Style

- React functional components only
- Tailwind for all styling — no custom CSS files
- Keep components small and focused
- No `localStorage` for user data — use Supabase

---

## Questions?

Open an Issue or reach out directly. Happy to help you get started.