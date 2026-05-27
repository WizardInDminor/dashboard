import httpx
from fastapi import APIRouter, HTTPException

from schemas.integrations import GithubActivityItem, NewsItem

router = APIRouter()

HN_TOP = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM = "https://hacker-news.firebaseio.com/v0/item/{id}.json"
GITHUB_EVENTS = "https://api.github.com/users/{username}/events/public"


@router.get("/news", response_model=list[NewsItem])
async def get_news():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            top = (await client.get(HN_TOP)).json()
            items = []
            for story_id in top[:5]:
                story = (await client.get(HN_ITEM.format(id=story_id))).json()
                if not story:
                    continue
                items.append(
                    NewsItem(
                        title=story.get("title", "(untitled)"),
                        url=story.get("url"),
                    )
                )
            return items
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502, detail="Could not fetch news feed."
        )


@router.get("/github", response_model=list[GithubActivityItem])
async def get_github_activity(username: str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                GITHUB_EVENTS.format(username=username),
                headers={"Accept": "application/vnd.github+json"},
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            resp.raise_for_status()
            events = resp.json()
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502, detail="Could not fetch GitHub activity."
        )

    activity = []
    for event in events:
        if event.get("type") != "PushEvent":
            continue
        commits = event.get("payload", {}).get("commits", [])
        activity.append(
            GithubActivityItem(
                type="PushEvent",
                repo=event.get("repo", {}).get("name", "unknown"),
                created_at=event.get("created_at", ""),
                message=commits[0]["message"] if commits else None,
            )
        )
        if len(activity) >= 10:
            break
    return activity
