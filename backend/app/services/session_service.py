"""Session management persisted to Supabase Postgres via SQLAlchemy."""

import uuid
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.db_models import SessionDB
from app.models.session import SessionStatus


def create_session(patient_ref: Optional[str] = None) -> SessionDB:
    """Create a new session and persist to Supabase Postgres."""
    db = SessionLocal()
    try:
        session = SessionDB(
            id=str(uuid.uuid4()),
            status=SessionStatus.PENDING,
            patient_ref=patient_ref,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(minutes=settings.SESSION_TTL_MINUTES),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    finally:
        db.close()


def get_session(session_id: str) -> Optional[SessionDB]:
    """Fetch a single session by ID from Supabase Postgres."""
    db = SessionLocal()
    try:
        return db.query(SessionDB).filter(SessionDB.id == session_id).first()
    finally:
        db.close()


def list_sessions() -> list[SessionDB]:
    """Return all sessions ordered newest first."""
    db = SessionLocal()
    try:
        return db.query(SessionDB).order_by(SessionDB.created_at.desc()).all()
    finally:
        db.close()


def update_session(session_id: str, **kwargs: object) -> Optional[SessionDB]:
    """Update any fields on a session by ID."""
    db = SessionLocal()
    try:
        session = db.query(SessionDB).filter(SessionDB.id == session_id).first()
        if not session:
            return None
        for key, value in kwargs.items():
            setattr(session, key, value)
        db.commit()
        db.refresh(session)
        return session
    finally:
        db.close()
