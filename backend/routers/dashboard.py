from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.task import Task
from schemas.dashboard import DashboardSummary, ProjectProgress

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    # Local time: this is a single-user tool whose backend runs on the user's
    # own machine, so "today" must match the user's wall clock — not UTC, which
    # rolls over hours early/late and made due-today tasks read as overdue.
    today_start = datetime.combine(datetime.now().date(), time.min)
    today_end = today_start + timedelta(days=1)

    overdue_count = (
        db.query(Task)
        .filter(
            Task.due_date.isnot(None),
            Task.due_date < today_start,
            Task.status != "done",
        )
        .count()
    )

    due_today = (
        db.query(Task)
        .filter(
            Task.due_date >= today_start,
            Task.due_date < today_end,
            Task.status != "done",
        )
        .order_by(Task.priority.desc())
        .all()
    )

    active_projects = (
        db.query(Project)
        .filter(Project.status == "active")
        .order_by(Project.updated_at.desc())
        .all()
    )
    in_progress_projects = []
    for project in active_projects:
        total = len(project.tasks)
        done = sum(1 for t in project.tasks if t.status == "done")
        in_progress_projects.append(
            ProjectProgress(
                id=project.id,
                title=project.title,
                color=project.color,
                status=project.status,
                total_tasks=total,
                done_tasks=done,
            )
        )

    recent_projects = (
        db.query(Project).order_by(Project.updated_at.desc()).limit(5).all()
    )

    return DashboardSummary(
        overdue_count=overdue_count,
        due_today=due_today,
        in_progress_projects=in_progress_projects,
        recent_projects=recent_projects,
    )
