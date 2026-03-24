"""Assessment storage and retrieval endpoints."""

import uuid
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, HTTPException

from app.schemas.assessment import WoundAssessmentResponse
from app.services import session_service

router = APIRouter()

# In-memory store (replace with Supabase DB / Postgres in production)
_assessments: Dict[str, dict] = {}
_session_to_assessment: Dict[str, str] = {}


def store_assessment(session_id: str, image_url: str, data: dict) -> str:
    """Persist assessment result from the background analysis task."""
    assessment_id = str(uuid.uuid4())
    patient_ref = None
    session = session_service.get_session(session_id)
    if session:
        patient_ref = session.patient_ref
    _assessments[assessment_id] = {
        "id": assessment_id,
        "sessionId": session_id,
        "imageUrl": image_url,
        "analyzedAt": datetime.utcnow().isoformat(),
        "patientRef": patient_ref,
        **data,
    }
    _session_to_assessment[session_id] = assessment_id
    return assessment_id


@router.get("/session/{session_id}", response_model=WoundAssessmentResponse)
async def get_assessment_by_session(session_id: str):
    """Retrieve assessment by the session that created it."""
    assessment_id = _session_to_assessment.get(session_id)
    if not assessment_id:
        raise HTTPException(404, "Assessment not found for this session")
    return _assessments[assessment_id]


@router.get("/{assessment_id}", response_model=WoundAssessmentResponse)
async def get_assessment(assessment_id: str):
    """Retrieve assessment by its own ID."""
    assessment = _assessments.get(assessment_id)
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    return assessment
