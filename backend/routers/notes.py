from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.note import Note
from models.project import Project
from schemas.note import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter()


def _get_note_or_404(note_id: int, db: Session) -> Note:
    note = db.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


def _validate_project(project_id: int | None, db: Session) -> None:
    if project_id is None:
        return
    exists = db.query(Project).filter(Project.id == project_id).first()
    if exists is None:
        raise HTTPException(status_code=404, detail="Project not found")


@router.post("")
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    _validate_project(payload.project_id, db)
    note = Note(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"data": NoteResponse.model_validate(note), "message": "Note created"}


@router.put("/{note_id}")
def update_note(
    note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)
):
    note = _get_note_or_404(note_id, db)
    fields = payload.model_dump(exclude_unset=True)
    if "project_id" in fields:
        _validate_project(fields["project_id"], db)
    for field, value in fields.items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return {"data": NoteResponse.model_validate(note), "message": "Note updated"}


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = _get_note_or_404(note_id, db)
    db.delete(note)
    db.commit()
    return {"data": {"id": note_id}, "message": "Note deleted"}
