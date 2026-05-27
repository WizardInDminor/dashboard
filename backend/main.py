from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Import routers (add as they are built)
# from routers import projects, tasks, dashboard, integrations, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers here as they are built:
# app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
# app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
# app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])
# app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
