# Personal Dashboard — Claude Code Guide

## Project Overview
A personal productivity dashboard with project management, task tracking, daily briefings,
and integrations (weather, calendar, news). Single-user, local tool. No auth required.

## Stack
- **Backend**: FastAPI + SQLAlchemy + SQLite (`backend/dashboard.db`)
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **AI**: Anthropic SDK (Python) on the backend — `claude-sonnet-4-20250514`
- **State**: React Query (server state) + Zustand (UI state)
- **Drag & Drop**: dnd-kit (for kanban board)

## Running the Project

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on port 3000
```

### API Docs
FastAPI auto-docs available at: http://localhost:8000/docs

## Project Structure
```
dashboard/
  backend/
    main.py              ← FastAPI app, CORS, router registration
    database.py          ← SQLAlchemy engine, session, Base
    models/
      project.py         ← Project ORM model
      task.py            ← Task ORM model
      note.py            ← Note ORM model
    schemas/
      project.py         ← Pydantic request/response schemas
      task.py
      note.py
    routers/
      projects.py        ← CRUD for projects
      tasks.py           ← CRUD for tasks
      dashboard.py       ← Aggregated dashboard data
      integrations.py    ← Weather, news, calendar
      ai.py              ← Claude-powered endpoints
    requirements.txt
  frontend/
    app/
      layout.tsx         ← Root layout with sidebar
      page.tsx           ← Dashboard home
      projects/
        page.tsx         ← Projects list
        [id]/page.tsx    ← Single project (kanban + notes)
      tasks/page.tsx     ← All tasks view
    components/
      layout/
        Sidebar.tsx
        Header.tsx
      widgets/
        WeatherWidget.tsx
        TaskSummaryWidget.tsx
        ProjectsWidget.tsx
      ui/                ← shadcn/ui components live here
    lib/
      api.ts             ← Axios instance pointed at localhost:8000
      queryClient.ts     ← React Query client setup
    hooks/
      useProjects.ts
      useTasks.ts
      useDashboard.ts
    types/
      index.ts           ← TypeScript types mirroring Pydantic schemas
```

## Coding Conventions

### Backend
- One router file per domain; register all routers in `main.py`
- Always use Pydantic schemas for request/response — never return ORM objects directly
- Use dependency injection for DB sessions: `db: Session = Depends(get_db)`
- Prefix all routes: `/api/projects`, `/api/tasks`, `/api/dashboard`, etc.
- Return consistent shapes: `{ data: ..., message: "..." }` for mutations
- Handle 404s explicitly with `HTTPException(status_code=404, detail="...")`

### Frontend
- Use App Router conventions — all pages are `page.tsx` inside `app/`
- Fetch data with React Query hooks defined in `hooks/`
- All API calls go through `lib/api.ts` — never use raw fetch
- Use shadcn/ui components first; only build custom components when needed
- Tailwind only — no inline styles, no CSS modules
- TypeScript strict mode — no `any` types

### AI Endpoints
- All Claude calls live in `backend/routers/ai.py`
- Always stream responses for long-form output (daily briefings, summaries)
- Keep system prompts in a `prompts/` dict at the top of `ai.py` — not inline

## Database
- SQLite file at `backend/dashboard.db`
- SQLAlchemy ORM with `Base.metadata.create_all()` on startup
- No migrations needed for now — drop and recreate on schema changes during dev

## Key Design Decisions (Already Made — Do Not Revisit)
- **No auth** — local single-user tool
- **SQLite** — simple, no setup, good enough for personal use
- **No Docker** — run services directly
- **shadcn/ui** — consistent component library, well-supported by Claude
- **Open-Meteo** — free weather API, no key needed
- **Anthropic API key** — read from `ANTHROPIC_API_KEY` env var

## Environment Variables
Create `backend/.env`:
```
ANTHROPIC_API_KEY=your_key_here
```
Frontend reads `NEXT_PUBLIC_API_URL=http://localhost:8000` from `frontend/.env.local`.

## What "Done" Looks Like for a Task
- Backend endpoint exists, is registered in `main.py`, and returns correct schema
- Frontend page/component renders real data from the API (no hardcoded mocks)
- No TypeScript errors (`npm run build` passes)
- No leftover `TODO` or `pass` placeholders in completed files
