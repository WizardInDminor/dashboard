from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.task import Task
from schemas.task import (
    TaskCreate,
    TaskReorder,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)

router = APIRouter()


def _get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Task)
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    # Default ordering is manual (sort_order); created_at breaks ties so
    # newly created tasks (all sharing sort_order 0) stay stable.
    return query.order_by(Task.sort_order.asc(), Task.created_at.desc()).all()


@router.patch("/reorder")
def reorder_tasks(payload: TaskReorder, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.id.in_(payload.task_ids)).all()
    by_id = {task.id: task for task in tasks}
    missing = [tid for tid in payload.task_ids if tid not in by_id]
    if missing:
        raise HTTPException(
            status_code=404, detail=f"Task(s) not found: {missing}"
        )
    for position, task_id in enumerate(payload.task_ids):
        by_id[task_id].sort_order = position
    db.commit()
    return {"data": {"count": len(payload.task_ids)}, "message": "Tasks reordered"}


@router.post("")
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"data": TaskResponse.model_validate(task), "message": "Task created"}


@router.put("/{task_id}")
def update_task(
    task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)
):
    task = _get_task_or_404(task_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return {"data": TaskResponse.model_validate(task), "message": "Task updated"}


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = _get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()
    return {"data": {"id": task_id}, "message": "Task deleted"}


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
