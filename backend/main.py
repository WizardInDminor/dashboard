from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401 — register ORM models on Base before create_all
from database import Base, engine
from migrate import ensure_sort_order_column
from routers import ai, dashboard, integrations, notes, projects, tasks

ensure_sort_order_column()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(
    integrations.router, prefix="/api/integrations", tags=["integrations"]
)
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
