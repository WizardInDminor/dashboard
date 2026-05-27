from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from schemas.note import NoteResponse
from schemas.task import TaskResponse


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"
    color: str = "#6366f1"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    color: Optional[str] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    task_count: int = 0


class ProjectDetailResponse(ProjectResponse):
    tasks: List[TaskResponse] = []
    notes: List[NoteResponse] = []
