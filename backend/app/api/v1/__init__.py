from fastapi import APIRouter
from app.api.v1.endpoints import sessions, capture, assessments

router = APIRouter()
router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
router.include_router(capture.router, prefix="/capture", tags=["capture"])
router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
