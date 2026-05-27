from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.task import Task
from schemas.project import (
    ProjectCreate,
    ProjectDetailResponse,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter()


def _get_project_or_404(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = (
        db.query(Project, func.count(Task.id).label("task_count"))
        .outerjoin(Task, Task.project_id == Project.id)
        .group_by(Project.id)
    )
    if status:
        query = query.filter(Project.status == status)
    rows = query.order_by(Project.updated_at.desc()).all()
    projects = []
    for project, task_count in rows:
        project.task_count = task_count
        projects.append(project)
    return projects


@router.post("")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return {
        "data": ProjectResponse.model_validate(project),
        "message": "Project created",
    }


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    project.task_count = len(project.tasks)
    return project


@router.put("/{project_id}")
def update_project(
    project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)
):
    project = _get_project_or_404(project_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return {
        "data": ProjectResponse.model_validate(project),
        "message": "Project updated",
    }


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = _get_project_or_404(project_id, db)
    db.delete(project)
    db.commit()
    return {"data": {"id": project_id}, "message": "Project deleted"}
