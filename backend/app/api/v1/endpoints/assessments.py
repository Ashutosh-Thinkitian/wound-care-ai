"""Assessment storage and retrieval endpoints — persisted to Supabase Postgres."""

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.database import SessionLocal
from app.models.db_models import AssessmentDB
from app.schemas.assessment import WoundAssessmentResponse
from app.services import session_service

router = APIRouter()


def store_assessment(session_id: str, image_url: str, data: dict) -> str:
    """Store assessment result in Supabase Postgres. Called from capture background task."""
    db = SessionLocal()
    try:
        session = session_service.get_session(session_id)
        assessment = AssessmentDB(
            id=str(uuid.uuid4()),
            session_id=session_id,
            image_url=image_url,
            patient_ref=session.patient_ref if session else None,
            analyzed_at=datetime.utcnow(),
            result=data,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment.id
    finally:
        db.close()


def _to_response(assessment: AssessmentDB) -> dict:
    """Flatten AssessmentDB into response dict by merging result JSONB with top-level fields."""
    return {
        "id": assessment.id,
        "sessionId": assessment.session_id,
        "imageUrl": assessment.image_url,
        "patientRef": assessment.patient_ref,
        "analyzedAt": assessment.analyzed_at.isoformat(),
        **assessment.result,
    }


@router.get("/session/{session_id}", response_model=WoundAssessmentResponse)
async def get_assessment_by_session(session_id: str):
    """Retrieve assessment by the session that created it."""
    db = SessionLocal()
    try:
        assessment = db.query(AssessmentDB).filter(
            AssessmentDB.session_id == session_id
        ).order_by(AssessmentDB.analyzed_at.desc()).first()
        if not assessment:
            raise HTTPException(404, "Assessment not found for this session")
        return _to_response(assessment)
    finally:
        db.close()


@router.get("/{assessment_id}", response_model=WoundAssessmentResponse)
async def get_assessment(assessment_id: str):
    """Retrieve assessment by its own ID."""
    db = SessionLocal()
    try:
        assessment = db.query(AssessmentDB).filter(
            AssessmentDB.id == assessment_id
        ).first()
        if not assessment:
            raise HTTPException(404, "Assessment not found")
        return _to_response(assessment)
    finally:
        db.close()
