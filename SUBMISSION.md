# Submission Guide

**How to review this submission (focus PRs):**
1) #1 – Foundation fixes: remove DOM APIs in React, add strict types, correct filtering, resilient loading/error states.
2) #2 – Backend performance: debounced search (300ms), server-side filtering, query params (search/sort/page/limit).
3) #3 – UI/UX modernization: responsive Tailwind UI, accessible labels/semantics, clear empty/error states.
4) #12 – Database integration: PostgreSQL + Drizzle ORM, multi-field search, sorting, pagination.

**Timeboxing & packaging note:**  
I completed the core dev in ~2 hours, then later packaged the work into clear, reviewable PRs to demonstrate real-world process (how I scope, sequence, and communicate changes). Some intermediary branches remain from that packaging step; please focus on PRs #1, #2, #3, and #12.

**How to run**
- `npm i && npm run dev`
- Optional DB (`docker compose up -d`, create DB `solaceassignment`, `npx drizzle-kit push`, seed via `POST /api/seed`). See README for details.

**What to look for (acceptance mapping)**
- Correct, type-safe data flow and React patterns (#1).
- Scalable search with debounced input and server-side filtering; pagination-ready API surface (#2).
- Accessible, responsive UI with professional states and clear feedback (#3).
- Real DB with search + sorting + pagination integrated end-to-end (#12).

**Performance/quality callouts**
- Debounce cuts redundant requests during typing and improves UX under load (#2).
- API accepts `search`, `sort`, `page`, `limit` for scalability and testability (#2/#12).
- DB-backed queries with Drizzle types ensure runtime + compile-time safety (#12).
