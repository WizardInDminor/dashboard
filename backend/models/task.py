from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="backlog")
    priority = Column(String, nullable=False, default="medium")
    due_date = Column(DateTime, nullable=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="tasks")
