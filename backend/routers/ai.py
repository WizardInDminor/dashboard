import json
import os
from datetime import datetime, time, timedelta
from typing import List, Optional

import anthropic
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.task import Task

load_dotenv()

router = APIRouter()

MODEL = "claude-sonnet-4-6"

prompts = {
    "briefing": (
        "You are a focused productivity assistant for a personal dashboard. "
        "Using the context provided, write a concise daily briefing in Markdown. "
        "Greet the user, summarize what is on their plate today (overdue and "
        "due-today tasks), highlight active projects, and propose a prioritized "
        "plan for the day as a short ordered list. Keep it under 250 words and "
        "be encouraging but direct."
    ),
    "prioritize": (
        "You are a productivity assistant. Given a list of tasks, return the "
        "best order to tackle them today. Consider priority, due dates, and "
        "project context. Respond ONLY with a JSON object of the form "
        '{"ordered": [{"id": <task_id>, "reason": "<short reason>"}]}. '
        "Include every task id exactly once. Do not add any prose outside the JSON."
    ),
    "chat": (
        "You are a helpful assistant embedded in a personal productivity "
        "dashboard. You can see a summary of the user's current projects and "
        "tasks below. Use it to give specific, practical answers. Be concise."
    ),
}


class ChatRequest(BaseModel):
    message: str
    page_context: Optional[str] = None


class PrioritizeRequest(BaseModel):
    task_ids: List[int]


def _get_client() -> anthropic.Anthropic:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY is not configured on the server.",
        )
    return anthropic.Anthropic()


def build_context(db: Session) -> str:
    """Summarize active projects and notable tasks for prompt injection."""
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_end = today_start + timedelta(days=1)

    active_projects = (
        db.query(Project).filter(Project.status == "active").all()
    )
    overdue = (
        db.query(Task)
        .filter(
            Task.due_date.isnot(None),
            Task.due_date < today_start,
            Task.status != "done",
        )
        .all()
    )
    due_today = (
        db.query(Task)
        .filter(
            Task.due_date >= today_start,
            Task.due_date < today_end,
            Task.status != "done",
        )
        .all()
    )

    lines = [f"Today's date: {datetime.utcnow().date().isoformat()}", ""]

    lines.append("Active projects:")
    if active_projects:
        for p in active_projects:
            done = sum(1 for t in p.tasks if t.status == "done")
            lines.append(f"- {p.title} ({done}/{len(p.tasks)} tasks done)")
    else:
        lines.append("- (none)")

    lines.append("")
    lines.append("Overdue tasks:")
    lines.extend(
        [f"- {t.title} (priority: {t.priority})" for t in overdue]
        or ["- (none)"]
    )

    lines.append("")
    lines.append("Tasks due today:")
    lines.extend(
        [f"- {t.title} (priority: {t.priority})" for t in due_today]
        or ["- (none)"]
    )

    return "\n".join(lines)


def _stream_text(system: str, user: str):
    client = _get_client()

    def generator():
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=1024,
                system=system,
                messages=[{"role": "user", "content": user}],
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except anthropic.APIError as exc:
            yield f"\n\n[AI request failed: {exc.__class__.__name__}]"

    return generator


@router.get("/briefing")
def daily_briefing(db: Session = Depends(get_db)):
    context = build_context(db)
    generator = _stream_text(
        prompts["briefing"],
        f"Here is the current context:\n\n{context}\n\nWrite today's briefing.",
    )
    return StreamingResponse(generator(), media_type="text/plain")


@router.post("/chat")
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    context = build_context(db)
    system = prompts["chat"] + "\n\nCurrent context:\n" + context
    if payload.page_context:
        system += f"\n\nThe user is currently viewing: {payload.page_context}"
    generator = _stream_text(system, payload.message)
    return StreamingResponse(generator(), media_type="text/plain")


@router.post("/prioritize")
def prioritize(payload: PrioritizeRequest, db: Session = Depends(get_db)):
    tasks = (
        db.query(Task).filter(Task.id.in_(payload.task_ids)).all()
        if payload.task_ids
        else []
    )
    if not tasks:
        raise HTTPException(status_code=404, detail="No matching tasks found")

    context = build_context(db)
    task_lines = [
        f"- id={t.id}: {t.title} "
        f"(priority: {t.priority}, status: {t.status}, "
        f"due: {t.due_date.isoformat() if t.due_date else 'none'})"
        for t in tasks
    ]
    user = (
        f"Context:\n{context}\n\nTasks to prioritize:\n"
        + "\n".join(task_lines)
    )

    client = _get_client()
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=prompts["prioritize"],
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.APIError as exc:
        raise HTTPException(
            status_code=502, detail=f"AI request failed: {exc.__class__.__name__}"
        )
    raw = "".join(
        block.text for block in response.content if block.type == "text"
    )
    try:
        parsed = json.loads(raw)
        ordered = parsed["ordered"]
    except (json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(
            status_code=502,
            detail="The model returned an unexpected response.",
        )

    return {"data": ordered, "message": "Tasks prioritized"}
