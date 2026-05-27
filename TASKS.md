# Dashboard — Task List

Claude Code: Work through tasks top to bottom within each section.
Mark tasks `[x]` when complete. Add notes below a task if something was decided or changed.
Do not skip tasks unless marked [BLOCKED]. Do not ask for clarification on tasks marked [READY].

---

## 🏗️ Phase 1 — Foundation [Start Here]

### Backend Setup
- [x] Create `backend/requirements.txt` with: fastapi, uvicorn, sqlalchemy, pydantic, pydantic-settings, anthropic, httpx, python-dotenv
  - Note: file already contained all required packages (pinned versions). Verified, no change needed.
  - Note: the committed `backend/venv/` was broken (built for Python 3.12, runtime here is 3.11) — recreated it and reinstalled requirements. Also untracked `venv/`, `__pycache__/`, `dashboard.db`, and `.env` from git since `.gitignore` already lists them.
- [x] Build `backend/database.py`: SQLAlchemy engine (SQLite), SessionLocal, Base, get_db dependency
  - Note: already implemented and correct; left as-is.
- [x] Build `backend/main.py`: FastAPI app, CORS (allow localhost:3000), register all routers, call `create_all` on startup
  - Note: imported `models` before `create_all` so tables register; uncommented and registered all five router stubs (projects, tasks, dashboard, integrations, ai) under their `/api/*` prefixes.
- [x] Create `backend/models/project.py`: Project model (id, title, description, status, color, created_at, updated_at)
  - Note: status defaults to "active", color defaults to "#6366f1"; has cascade relationships to tasks and notes.
- [x] Create `backend/models/task.py`: Task model (id, title, description, status, priority, due_date, project_id FK, created_at)
  - Note: status defaults to "backlog", priority to "medium"; project_id is nullable with ON DELETE CASCADE.
- [x] Create `backend/models/note.py`: Note model (id, content, project_id FK, created_at)
- [x] Create Pydantic schemas in `backend/schemas/` mirroring each model (Base, Create, Update, Response variants)
  - Note: Response variants use `ConfigDict(from_attributes=True)`. Added `TaskStatusUpdate` for the Phase 3 kanban PATCH endpoint.

### Frontend Setup
- [x] Initialize Next.js 14 app in `frontend/` with TypeScript, Tailwind, App Router (`npx create-next-app@latest`)
  - Decision: `create-next-app@latest` now scaffolds Next 16 + React 19 + Tailwind v4. Pinned to `create-next-app@14` (Next 14.2.35, React 18, Tailwind v3.4) to match the spec and shadcn/ui compatibility.
  - Note: create-next-app ran `git init` inside `frontend/`, leaving a stale submodule gitlink in the parent repo — removed it and re-added `frontend/` as a normal tracked directory.
- [x] Install dependencies: `@tanstack/react-query`, `axios`, `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `lucide-react`
- [x] Initialize shadcn/ui (`npx shadcn@latest init`) — use "slate" base color, CSS variables on
  - Decision: the shadcn registry (ui.shadcn.com) is blocked (HTTP 403) by this environment's network policy, so the CLI cannot init/add. Set up shadcn manually instead: `components.json` (slate base, cssVariables on), `lib/utils.ts` (cn helper), Tailwind theme extension + `tailwindcss-animate`, and slate HSL CSS variables in `globals.css`.
- [x] Add shadcn components: button, card, badge, input, textarea, select, dialog, sheet, dropdown-menu, tabs, separator, avatar
  - Note: written manually (default-style shadcn source) into `components/ui/` with the matching Radix primitives installed, since the registry is unreachable.
- [x] Create `frontend/lib/api.ts`: Axios instance with baseURL from env
- [x] Create `frontend/lib/queryClient.ts`: React Query client with sensible defaults
- [x] Create `frontend/types/index.ts`: TypeScript interfaces for Project, Task, Note matching backend schemas
- [x] Build `frontend/app/layout.tsx`: Root layout wrapping app in QueryClientProvider + Zustand, renders Sidebar
  - Note: QueryClientProvider lives in client component `components/providers.tsx`. Zustand needs no provider; created `lib/store.ts` (`useUIStore`) for sidebar collapse state. Layout renders Sidebar + Header + main. Replaced the default template `app/page.tsx` with a minimal placeholder (real home is Phase 4).
- [x] Build `frontend/components/layout/Sidebar.tsx`: Nav links to Dashboard, Projects, Tasks. Collapsible, icons from lucide-react
- [x] Build `frontend/components/layout/Header.tsx`: Page title + date/time display

---

## 📁 Phase 2 — Projects Module

### Backend
- [x] Build `backend/routers/projects.py`:
  - `GET /api/projects` — list all, support `?status=` filter
  - `POST /api/projects` — create
  - `GET /api/projects/{id}` — get single with tasks + notes
  - `PUT /api/projects/{id}` — update
  - `DELETE /api/projects/{id}` — delete (cascade tasks + notes)
  - Note: mutations return `{ data, message }` per CLAUDE.md; list returns a plain array; detail returns `ProjectDetailResponse` (project + tasks + notes).
  - Note: added a `task_count` field to `ProjectResponse`, populated in the list endpoint via an outer-join `func.count` (avoids N+1) and set to `len(tasks)` on the detail endpoint. Cascade delete verified (tasks + notes removed with the project).
  - Decision: the kanban needs to persist drags, so the single `PATCH /api/tasks/{id}/status` endpoint was added to `routers/tasks.py` now (Phase 2). The rest of the tasks router is built in Phase 3.

### Frontend
- [x] Build `frontend/hooks/useProjects.ts`: React Query hooks (useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject)
  - Note: also added `frontend/hooks/useTasks.ts` with just `useUpdateTaskStatus` (used by the kanban); expanded in Phase 3.
- [x] Build `frontend/app/projects/page.tsx`: Grid of project cards. Each card shows title, status badge, task count, color accent. "New Project" button opens a dialog
  - Note: includes loading/error/empty states.
- [x] Build `frontend/components/ui/ProjectCard.tsx`: Card component with color strip, title, description, status, quick actions
  - Note: quick actions (Edit/Delete) live in a dropdown menu; delete uses a confirm() guard.
- [x] Build `frontend/components/ui/ProjectDialog.tsx`: Create/edit form in a shadcn Dialog
  - Decision: color picker uses inline `style={{ backgroundColor }}` for the swatches and project color strips. This is the documented exception to the Tailwind-only rule — colors are dynamic data values that Tailwind's JIT cannot generate from runtime strings.
- [x] Build `frontend/app/projects/[id]/page.tsx`: Project detail page with tabs: Kanban | List | Notes
  - Note: Notes tab is read-only (displays notes from the detail endpoint); there is no notes write API in any phase spec, so creation was not added.
- [x] Build Kanban board on project detail page using dnd-kit. Columns: Backlog, In Progress, Review, Done. Cards are tasks — dragging updates task status via API
  - Note: `KanbanBoard.tsx` uses `@dnd-kit/core` (DndContext + useDraggable + useDroppable + DragOverlay); drop optimistically updates local state and fires `PATCH /api/tasks/{id}/status`. Drag interaction was not manually exercised in a browser in this environment (no GUI); build, types, and the underlying API were verified.

---

## ✅ Phase 3 — Tasks Module

### Backend
- [x] Build `backend/routers/tasks.py`:
  - `GET /api/tasks` — list all, support `?project_id=`, `?status=`, `?priority=` filters
  - `POST /api/tasks` — create
  - `PUT /api/tasks/{id}` — update (status, priority, due_date, etc.)
  - `DELETE /api/tasks/{id}` — delete
  - `PATCH /api/tasks/{id}/status` — quick status update (used by kanban drag)
  - Note: expanded the router started in Phase 2; mutations return `{ data, message }`. Verified all filters, CRUD, and that project `task_count` reflects task creation.

### Frontend
- [x] Build `frontend/hooks/useTasks.ts`: React Query hooks for all task operations
  - Note: useTasks (with filters), useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus. All invalidate task lists + affected project caches.
- [x] Build `frontend/app/tasks/page.tsx`: Full task list with filters (status, priority, project). Grouped by project or due date toggle
  - Note: status/priority/project filters hit the API; grouping (Project / Due date buckets: Overdue, Today, This Week, Later, No due date) is client-side. Includes loading/error/empty states.
- [x] Build `frontend/components/ui/TaskRow.tsx`: Inline-editable task row with checkbox, title, priority badge, due date, project chip
  - Note: checkbox toggles done/backlog; title is inline-editable (click → input, Enter/blur saves, Esc cancels); overdue due dates render in destructive color; edit/delete in a dropdown.
- [x] Build `frontend/components/ui/TaskDialog.tsx`: Full task create/edit form
  - Note: date `<input type="date">` is converted to ISO datetime on submit. "No project" maps to null (Radix Select can't use an empty-string value, so a `"none"` sentinel is used).

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
- [ ] SECURITY: `backend/.env` containing a real `ANTHROPIC_API_KEY` was committed to git history (now untracked going forward). The key is still exposed in prior history — recommend rotating the API key and, if desired, scrubbing it from history (e.g. `git filter-repo`). Needs owner decision.

---

## ✅ Completed
<!-- Move finished tasks here with date -->
