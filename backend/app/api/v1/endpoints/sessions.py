from fastapi import APIRouter, HTTPException
from app.schemas.session import CreateSessionRequest, SessionResponse
from app.services import session_service
from app.core.config import settings

router = APIRouter()

def _to_response(session, frontend_url: str) -> SessionResponse:
    return SessionResponse(
        id=session.id,
        patientRef=session.patient_ref,
        createdAt=session.created_at.isoformat(),
        expiresAt=session.expires_at.isoformat() if session.expires_at else "",
        status=session.status,
        qrUrl=f"{frontend_url}/capture/{session.id}",
        assessmentId=session.assessment_id,
    )

@router.post("", response_model=SessionResponse)
async def create_session(body: CreateSessionRequest):
    session = session_service.create_session(patient_ref=body.patientRef)
    return _to_response(session, settings.FRONTEND_URL)

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return _to_response(session, settings.FRONTEND_URL)

@router.get("/{session_id}/status", response_model=SessionResponse)
async def get_session_status(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return _to_response(session, settings.FRONTEND_URL)
