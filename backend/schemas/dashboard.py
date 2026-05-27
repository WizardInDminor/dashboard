from typing import List

from pydantic import BaseModel

from schemas.project import ProjectResponse
from schemas.task import TaskResponse


class ProjectProgress(BaseModel):
    id: int
    title: str
    color: str
    status: str
    total_tasks: int
    done_tasks: int


class DashboardSummary(BaseModel):
    overdue_count: int
    due_today: List[TaskResponse]
    in_progress_projects: List[ProjectProgress]
    recent_projects: List[ProjectResponse]
