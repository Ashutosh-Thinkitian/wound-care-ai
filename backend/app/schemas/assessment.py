"""Pydantic schemas for the wound assessment API response."""

from typing import List, Optional

from pydantic import BaseModel


class WoundDimensions(BaseModel):
    lengthCm: str
    widthCm: str
    depthCm: str
    note: str


class ExudateInfo(BaseModel):
    amount: str
    type: str


class WoundAssessmentResponse(BaseModel):
    id: str
    sessionId: str
    imageUrl: str
    analyzedAt: str
    patientRef: Optional[str] = None
    woundType: str
    probableCause: str
    estimatedDimensions: WoundDimensions
    woundDepth: str
    woundStage: Optional[str] = None
    woundBed: str
    exudate: ExudateInfo
    periwoundSkin: str
    infectionSigns: List[str]
    diagnosis: str
    differentialDiagnosis: List[str]
    severity: str
    healingPhase: str
    immediateActions: List[str]
    dressingSuggestions: List[str]
    referralRecommendations: List[str]
    followUpTimeline: str
    additionalWorkup: List[str]
    redFlags: List[str]
    disclaimer: str
