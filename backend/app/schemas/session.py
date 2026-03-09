from pydantic import BaseModel
from typing import Optional
from datetime import datetime
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
