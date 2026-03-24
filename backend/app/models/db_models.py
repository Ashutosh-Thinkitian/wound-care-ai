"""SQLAlchemy ORM models for sessions and assessments tables."""

from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base
from app.models.session import SessionStatus


class SessionDB(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    status = Column(SAEnum(SessionStatus, name="sessionstatus", create_constraint=False, native_enum=False), nullable=False, default=SessionStatus.PENDING)
    patient_ref = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    assessment_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class AssessmentDB(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True)
    session_id = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    patient_ref = Column(String, nullable=True)
    analyzed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    result = Column(JSONB, nullable=False)
