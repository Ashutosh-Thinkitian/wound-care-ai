import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
from app.models.session import Session, SessionStatus
from app.core.config import settings

# In-memory store (replace with Redis/DB in production)
_sessions: Dict[str, Session] = {}

def create_session(patient_ref: Optional[str] = None) -> Session:
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
    return _sessions.get(session_id)

def update_session(session_id: str, **kwargs) -> Optional[Session]:
    session = _sessions.get(session_id)
    if not session:
        return None
    for k, v in kwargs.items():
        setattr(session, k, v)
    return session
