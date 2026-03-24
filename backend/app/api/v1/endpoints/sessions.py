"""Session management endpoints — create, get, and poll session status."""

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.session import CreateSessionRequest, SessionResponse
from app.services import session_service

router = APIRouter()


def _to_response(session, frontend_url: str) -> SessionResponse:
    """Convert an internal Session object to the API response schema."""
    return SessionResponse(
        id=session.id,
        patientRef=session.patient_ref,
        createdAt=session.created_at.isoformat(),
        expiresAt=session.expires_at.isoformat() if session.expires_at else "",
        status=session.status,
        qrUrl=f"{frontend_url}/capture/{session.id}",
        assessmentId=session.assessment_id,
    )


@router.get("", response_model=list[SessionResponse])
async def list_sessions():
    """List all sessions ordered by creation date (newest first)."""
    sessions = session_service.list_sessions()
    return [_to_response(s, settings.FRONTEND_URL) for s in sessions]


@router.post("", response_model=SessionResponse)
async def create_session(body: CreateSessionRequest):
    """Create a new wound assessment session."""
    session = session_service.create_session(patient_ref=body.patientRef)
    return _to_response(session, settings.FRONTEND_URL)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Get full session details by ID."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return _to_response(session, settings.FRONTEND_URL)


@router.get("/{session_id}/status", response_model=SessionResponse)
async def get_session_status(session_id: str):
    """Poll session status — used by frontend for real-time updates."""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return _to_response(session, settings.FRONTEND_URL)
