# Dashboard — Task List

Claude Code: Work through tasks top to bottom within each section.
Mark tasks `[x]` when complete. Add notes below a task if something was decided or changed.
Do not skip tasks unless marked [BLOCKED]. Do not ask for clarification on tasks marked [READY].

---

## 🏗️ Phase 1 — Foundation [Start Here]

### Backend Setup
- [ ] Create `backend/requirements.txt` with: fastapi, uvicorn, sqlalchemy, pydantic, pydantic-settings, anthropic, httpx, python-dotenv
- [ ] Build `backend/database.py`: SQLAlchemy engine (SQLite), SessionLocal, Base, get_db dependency
- [ ] Build `backend/main.py`: FastAPI app, CORS (allow localhost:3000), register all routers, call `create_all` on startup
- [ ] Create `backend/models/project.py`: Project model (id, title, description, status, color, created_at, updated_at)
- [ ] Create `backend/models/task.py`: Task model (id, title, description, status, priority, due_date, project_id FK, created_at)
- [ ] Create `backend/models/note.py`: Note model (id, content, project_id FK, created_at)
- [ ] Create Pydantic schemas in `backend/schemas/` mirroring each model (Base, Create, Update, Response variants)

### Frontend Setup
- [ ] Initialize Next.js 14 app in `frontend/` with TypeScript, Tailwind, App Router (`npx create-next-app@latest`)
- [ ] Install dependencies: `@tanstack/react-query`, `axios`, `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `lucide-react`
- [ ] Initialize shadcn/ui (`npx shadcn@latest init`) — use "slate" base color, CSS variables on
- [ ] Add shadcn components: button, card, badge, input, textarea, select, dialog, sheet, dropdown-menu, tabs, separator, avatar
- [ ] Create `frontend/lib/api.ts`: Axios instance with baseURL from env
- [ ] Create `frontend/lib/queryClient.ts`: React Query client with sensible defaults
- [ ] Create `frontend/types/index.ts`: TypeScript interfaces for Project, Task, Note matching backend schemas
- [ ] Build `frontend/app/layout.tsx`: Root layout wrapping app in QueryClientProvider + Zustand, renders Sidebar
- [ ] Build `frontend/components/layout/Sidebar.tsx`: Nav links to Dashboard, Projects, Tasks. Collapsible, icons from lucide-react
- [ ] Build `frontend/components/layout/Header.tsx`: Page title + date/time display

---

## 📁 Phase 2 — Projects Module

### Backend
- [ ] Build `backend/routers/projects.py`:
  - `GET /api/projects` — list all, support `?status=` filter
  - `POST /api/projects` — create
  - `GET /api/projects/{id}` — get single with tasks + notes
  - `PUT /api/projects/{id}` — update
  - `DELETE /api/projects/{id}` — delete (cascade tasks + notes)

### Frontend
- [ ] Build `frontend/hooks/useProjects.ts`: React Query hooks (useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject)
- [ ] Build `frontend/app/projects/page.tsx`: Grid of project cards. Each card shows title, status badge, task count, color accent. "New Project" button opens a dialog
- [ ] Build `frontend/components/ui/ProjectCard.tsx`: Card component with color strip, title, description, status, quick actions
- [ ] Build `frontend/components/ui/ProjectDialog.tsx`: Create/edit form in a shadcn Dialog
- [ ] Build `frontend/app/projects/[id]/page.tsx`: Project detail page with tabs: Kanban | List | Notes
- [ ] Build Kanban board on project detail page using dnd-kit. Columns: Backlog, In Progress, Review, Done. Cards are tasks — dragging updates task status via API

---

## ✅ Phase 3 — Tasks Module

### Backend
- [ ] Build `backend/routers/tasks.py`:
  - `GET /api/tasks` — list all, support `?project_id=`, `?status=`, `?priority=` filters
  - `POST /api/tasks` — create
  - `PUT /api/tasks/{id}` — update (status, priority, due_date, etc.)
  - `DELETE /api/tasks/{id}` — delete
  - `PATCH /api/tasks/{id}/status` — quick status update (used by kanban drag)

### Frontend
- [ ] Build `frontend/hooks/useTasks.ts`: React Query hooks for all task operations
- [ ] Build `frontend/app/tasks/page.tsx`: Full task list with filters (status, priority, project). Grouped by project or due date toggle
- [ ] Build `frontend/components/ui/TaskRow.tsx`: Inline-editable task row with checkbox, title, priority badge, due date, project chip
- [ ] Build `frontend/components/ui/TaskDialog.tsx`: Full task create/edit form

---

## 🏠 Phase 4 — Dashboard Home

### Backend
- [ ] Build `backend/routers/dashboard.py`:
  - `GET /api/dashboard/summary` — returns: overdue task count, tasks due today, in-progress projects, recently updated projects

### Widgets
- [ ] Build `frontend/components/widgets/TaskSummaryWidget.tsx`: Shows today's tasks + overdue count. Links to /tasks
- [ ] Build `frontend/components/widgets/ProjectsWidget.tsx`: Shows active projects with progress bars (done tasks / total tasks)
- [ ] Build `frontend/components/widgets/WeatherWidget.tsx`: Calls Open-Meteo API (https://api.open-meteo.com/v1/forecast) — auto-detect or hardcode a lat/lon in a config. Shows temp, condition, weekly forecast
- [ ] Build `frontend/app/page.tsx`: Dashboard home assembling all widgets in a responsive grid. Shows current date + greeting

---

## 🤖 Phase 5 — AI Features

### Backend
- [ ] Build `backend/routers/ai.py`:
  - `GET /api/ai/briefing` — streams a daily briefing using Claude: pulls today's tasks, active projects, and generates a prioritized plan for the day
  - `POST /api/ai/prioritize` — takes a list of task IDs, returns them re-ordered with reasoning
  - `POST /api/ai/chat` — general assistant chat, streamed, with system context injected (current projects + tasks summary)
- [ ] Inject project/task context into all AI prompts automatically by querying the DB before each call

### Frontend
- [ ] Build `frontend/components/widgets/DailyBriefingWidget.tsx`: Streams and renders the AI briefing on dashboard load. Markdown rendered output. "Refresh" button
- [ ] Build `frontend/components/layout/AISidebar.tsx`: Slide-out panel (shadcn Sheet) with persistent chat. Aware of current page context. Sends page context header to `/api/ai/chat`

---

## 📰 Phase 6 — Integrations (Nice to Have)

- [ ] Build `backend/routers/integrations.py`:
  - `GET /api/integrations/news` — fetches from a free RSS feed (e.g. Hacker News, BBC via rss2json) and returns top 5 headlines
- [ ] Build `frontend/components/widgets/NewsWidget.tsx`: Shows headlines with links. Refreshes every 30 min
- [ ] Add GitHub activity widget: `GET /api/integrations/github?username=X` — hits GitHub public API for recent push events

---

## 🎨 Phase 7 — Polish

- [ ] Add loading skeletons to all data-fetching components (shadcn Skeleton)
- [ ] Add empty states to Projects and Tasks pages
- [ ] Add toast notifications for create/update/delete actions (shadcn Sonner)
- [ ] Make layout fully responsive (mobile sidebar collapses to bottom nav)
- [ ] Dark mode toggle using next-themes
- [ ] Favicon + page titles per route (`metadata` export in each page.tsx)

---

## 🚫 Blocked / Needs Decision
- [ ] Calendar integration — needs decision on source (Google Calendar OAuth vs iCal URL vs manual entry)

---

## ✅ Completed
<!-- Move finished tasks here with date -->
