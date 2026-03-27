"""Pydantic schemas for session API request/response."""

from typing import Optional

from pydantic import BaseModel

from app.models.session import SessionStatus


class CreateSessionRequest(BaseModel):
    patientRef: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    patientRef: Optional[str]
    createdAt: str
    expiresAt: str
    status: SessionStatus
    qrUrl: str
    imageUrl: Optional[str] = None
    assessmentId: Optional[str] = None
