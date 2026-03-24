"""In-memory session management for wound assessment encounters."""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

from app.core.config import settings
from app.models.session import Session, SessionStatus

# In-memory store (replace with Redis/DB in production)
_sessions: Dict[str, Session] = {}


def create_session(patient_ref: Optional[str] = None) -> Session:
    """Create a new session with a unique ID and expiry time."""
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()
    session = Session(
        id=session_id,
        patient_ref=patient_ref,
        created_at=now,
        expires_at=now + timedelta(minutes=settings.SESSION_TTL_MINUTES),
    )
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[Session]:
    """Retrieve a session by ID, or None if not found."""
    return _sessions.get(session_id)


def update_session(session_id: str, **kwargs: object) -> Optional[Session]:
    """Update session fields. Returns the updated session or None if not found."""
    session = _sessions.get(session_id)
    if not session:
        return None
    for k, v in kwargs.items():
        setattr(session, k, v)
    return session


def list_sessions() -> list[Session]:
    """Return all sessions ordered by created_at descending (newest first)."""
    return sorted(_sessions.values(), key=lambda s: s.created_at, reverse=True)
