from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "backlog"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
