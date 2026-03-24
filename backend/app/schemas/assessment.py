"""Pydantic schemas for the wound assessment API response."""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class WoundDepth(str, Enum):
    SUPERFICIAL = "superficial"
    PARTIAL_THICKNESS = "partial_thickness"
    FULL_THICKNESS = "full_thickness"
    UNKNOWN = "unknown"


class Severity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"


class HealingPhase(str, Enum):
    INFLAMMATORY = "inflammatory"
    PROLIFERATIVE = "proliferative"
    REMODELING = "remodeling"
    CHRONIC = "chronic"
    UNKNOWN = "unknown"


class ExudateAmount(str, Enum):
    NONE = "none"
    SCANT = "scant"
    MODERATE = "moderate"
    HEAVY = "heavy"


class WoundDimensions(BaseModel):
    lengthCm: str
    widthCm: str
    depthCm: str
    note: str


class ExudateInfo(BaseModel):
    amount: ExudateAmount
    type: str


class WoundAssessmentResponse(BaseModel):
    id: str
    sessionId: str
    imageUrl: str
    analyzedAt: str
    woundType: str
    probableCause: str
    estimatedDimensions: WoundDimensions
    woundDepth: WoundDepth
    woundStage: Optional[str]
    woundBed: str
    exudate: ExudateInfo
    periwoundSkin: str
    infectionSigns: List[str]
    diagnosis: str
    differentialDiagnosis: List[str]
    severity: Severity
    healingPhase: HealingPhase
    immediateActions: List[str]
    dressingSuggestions: List[str]
    referralRecommendations: List[str]
    followUpTimeline: str
    additionalWorkup: List[str]
    redFlags: List[str]
    disclaimer: str
