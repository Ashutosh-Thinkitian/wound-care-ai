from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

class SessionStatus(str, Enum):
    PENDING = "pending"
    IMAGE_RECEIVED = "image_received"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    ERROR = "error"

@dataclass
class Session:
    id: str
    status: SessionStatus = SessionStatus.PENDING
    patient_ref: Optional[str] = None
    image_url: Optional[str] = None          # Supabase public URL
    assessment_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    error_message: Optional[str] = None
