# Personal Dashboard

A personal productivity dashboard with project management, task tracking, AI briefings, and integrations.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## For Claude Code
See CLAUDE.md for full conventions and architecture.
See TASKS.md for the current task list — work top to bottom.
