from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.task import Task
from schemas.task import TaskResponse, TaskStatusUpdate

router = APIRouter()


def _get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/status")
def update_task_status(
    task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)
):
    task = _get_task_or_404(task_id, db)
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return {
        "data": TaskResponse.model_validate(task),
        "message": "Task status updated",
    }
