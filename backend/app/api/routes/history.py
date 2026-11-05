"""User profile, history, and turn retrieval endpoints."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.database.models import Achievement, DebateSession, Fallacy, Turn, User

router = APIRouter()


class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


def _parse_uuid(value: str) -> UUID:
    try:
        return UUID(value)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid user id")


def _skill_label(skill: float) -> str:
    if skill >= 0.8:
        return "Expert"
    if skill >= 0.65:
        return "Advanced"
    if skill >= 0.5:
        return "Intermediate"
    return "Beginner"


async def _get_or_create_user(db: AsyncSession, user_id: str) -> User:
    uid = _parse_uuid(user_id)
    result = await db.execute(select(User).where(User.user_id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(user_id=uid)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def _load_sessions(db: AsyncSession, user_id: UUID):
    result = await db.execute(
        select(DebateSession)
        .where(DebateSession.user_id == user_id)
        .order_by(DebateSession.started_at.desc())
    )
    return result.scalars().all()


def _session_summary(session: DebateSession) -> dict:
    return {
        "session_id": session.session_id,
        "topic": session.topic,
        "difficulty": session.difficulty,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "total_turns": session.total_turns,
        "performance": session.overall_performance,
        "avg_argument_strength": session.avg_argument_strength,
    }


def _skill_trend(sessions) -> tuple[str, Optional[float]]:
    completed = [
        s for s in reversed(sessions)
        if s.status == "completed" and s.avg_argument_strength is not None
    ]
    if len(completed) < 4:
        return "insufficient_data", None

    half = len(completed) // 2
    early = [s.avg_argument_strength for s in completed[:half]]
    recent = [s.avg_argument_strength for s in completed[half:]]
    early_avg = sum(early) / len(early)
    recent_avg = sum(recent) / len(recent)

    if early_avg == 0:
        return ("improving" if recent_avg > 0 else "stable"), None

    change = ((recent_avg - early_avg) / early_avg) * 100
    if change > 5:
        trend = "improving"
    elif change < -5:
        trend = "declining"
    else:
        trend = "stable"
    return trend, round(change, 1)


@router.get("/debate/{session_id}/turns")
async def get_debate_turns(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Return all saved turns for a debate session."""
    result = await db.execute(
        select(Turn)
        .where(Turn.session_id == session_id)
        .order_by(Turn.turn_number)
    )
    turns = result.scalars().all()

    return {
        "session_id": session_id,
        "turns": [
            {
                "turn_id": str(turn.turn_id),
                "turn_number": turn.turn_number,
                "user_input": turn.user_input,
                "ai_response": turn.ai_response,
                "analyzer_output": turn.analyzer_output,
                "research_output": turn.research_output,
                "socratic_output": turn.socratic_output,
                "advocate_output": turn.advocate_output,
                "user_skill_at_turn": turn.user_skill_at_turn,
                "argument_strength": turn.argument_strength,
                "timestamp": turn.timestamp,
            }
            for turn in turns
        ],
    }


@router.get("/{user_id}/profile")
async def get_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Return the full profile payload used by the Profile page."""
    user = await _get_or_create_user(db, user_id)
    sessions = await _load_sessions(db, user.user_id)
    completed = [s for s in sessions if s.status == "completed"]

    result = await db.execute(
        select(Fallacy).where(
            Fallacy.session_id.in_([s.session_id for s in sessions])
        )
    ) if sessions else None
    fallacies = result.scalars().all() if result is not None else []

    result = await db.execute(
        select(Achievement)
        .where(Achievement.user_id == user.user_id)
        .order_by(Achievement.earned_at.desc())
    )
    achievements = result.scalars().all()

    strengths = [s.avg_argument_strength for s in completed if s.avg_argument_strength is not None]
    avg_strength = sum(strengths) / len(strengths) if strengths else 0.0

    breakdown = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
    for session in completed:
        if session.overall_performance in breakdown:
            breakdown[session.overall_performance] += 1

    diff_counts: dict[str, int] = {}
    for session in sessions:
        diff_counts[session.difficulty] = diff_counts.get(session.difficulty, 0) + 1
    preferred = max(diff_counts, key=diff_counts.get) if diff_counts else None

    trend, improvement = _skill_trend(sessions)

    return {
        "user": {
            "user_id": str(user.user_id),
            "username": user.username,
            "email": user.email,
            "current_skill_level": user.current_skill_level or 0.5,
            "skill_label": _skill_label(user.current_skill_level or 0.5),
            "member_since": user.created_at or datetime.utcnow().isoformat(),
        },
        "stats": {
            "total_debates": len(sessions),
            "completed_debates": len(completed),
            "avg_argument_strength": round(avg_strength, 2),
            "total_fallacies": len(fallacies),
            "avg_fallacies_per_debate": round(len(fallacies) / len(completed), 2) if completed else 0.0,
            "performance_breakdown": breakdown,
            "skill_trend": trend,
            "improvement_percentage": improvement,
            "preferred_difficulty": preferred,
        },
        "achievements": {
            "total": len(achievements),
            "list": [
                {
                    "badge_name": a.badge_name,
                    "description": a.description,
                    "earned_at": a.earned_at,
                }
                for a in achievements
            ],
        },
        "recent_debates": [_session_summary(s) for s in sessions[:20]],
        "growth_trajectory": [
            {
                "session_id": s.session_id,
                "topic": s.topic,
                "started_at": s.started_at,
                "argument_strength": s.avg_argument_strength,
                "performance": s.overall_performance,
            }
            for s in reversed(completed)
        ],
    }


@router.patch("/{user_id}/update")
async def update_profile(
    user_id: str,
    request: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update editable profile fields."""
    user = await _get_or_create_user(db, user_id)

    if request.username is not None:
        user.username = request.username.strip() or None
    if request.email is not None:
        user.email = request.email.strip() or None

    await db.commit()
    await db.refresh(user)

    return {
        "user_id": str(user.user_id),
        "username": user.username,
        "email": user.email,
    }


@router.get("/{user_id}/history")
async def get_history(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Return recent debate history for the sidebar/history tab."""
    user = await _get_or_create_user(db, user_id)
    sessions = await _load_sessions(db, user.user_id)

    return {
        "user_id": str(user.user_id),
        "total_debates": len(sessions),
        "current_skill": user.current_skill_level or 0.5,
        "debates": [_session_summary(s) for s in sessions[:limit]],
    }
