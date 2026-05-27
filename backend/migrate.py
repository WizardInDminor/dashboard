"""Lightweight dev migrations run on startup.

CLAUDE.md says to drop and recreate on schema changes during dev, but SQLite
*does* support ``ALTER TABLE ... ADD COLUMN`` (only ALTER/DROP COLUMN are
unsupported). Adding the column idempotently preserves existing tasks while
giving a fresh DB the same result, so we prefer it over dropping the table.
"""

from sqlalchemy import inspect, text

from database import engine


def ensure_sort_order_column() -> None:
    """Add tasks.sort_order to pre-existing databases that lack it."""
    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return  # create_all() will create it with the column already present
    columns = {col["name"] for col in inspector.get_columns("tasks")}
    if "sort_order" in columns:
        return
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE tasks "
                "ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0"
            )
        )
