from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NoteBase(BaseModel):
    content: str
    project_id: Optional[int] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    project_id: Optional[int] = None


class NoteResponse(NoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
