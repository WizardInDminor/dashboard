from typing import Optional

from pydantic import BaseModel


class NewsItem(BaseModel):
    title: str
    url: Optional[str] = None
    source: str = "Hacker News"


class GithubActivityItem(BaseModel):
    type: str
    repo: str
    created_at: str
    message: Optional[str] = None
