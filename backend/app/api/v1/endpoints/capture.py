import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import session_service
from app.services.storage_service import upload_wound_image
from app.services.claude_service import analyze_wound_image_from_bytes
from app.models.session import SessionStatus

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_SIZE_MB = 10

@router.post("/{session_id}")
async def upload_wound_image_endpoint(session_id: str, file: UploadFile = File(...)):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status not in (SessionStatus.PENDING,):
        raise HTTPException(400, "Session already has an image")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (max {MAX_SIZE_MB}MB)")

    # Upload to Supabase Storage
    image_url = upload_wound_image(
        file_bytes=content,
        original_filename=file.filename or "wound.jpg",
        session_id=session_id,
    )

    session_service.update_session(
        session_id,
        status=SessionStatus.IMAGE_RECEIVED,
        image_url=image_url,        # store public URL, not local path
    )

    # Trigger AI analysis in background (pass raw bytes — no disk read needed)
    asyncio.create_task(_run_analysis(session_id, content, file.filename or "wound.jpg", image_url))

    return {"message": "Image received. Analysis in progress."}


async def _run_analysis(session_id: str, image_bytes: bytes, filename: str, image_url: str):
    """Background task: send image bytes to Claude, store result."""
    session_service.update_session(session_id, status=SessionStatus.ANALYZING)
    try:
        result = await asyncio.to_thread(
            analyze_wound_image_from_bytes, image_bytes, filename
        )
        from app.api.v1.endpoints.assessments import store_assessment
        assessment_id = store_assessment(session_id, image_url, result)
        session_service.update_session(
            session_id, status=SessionStatus.COMPLETE, assessment_id=assessment_id
        )
    except Exception as e:
        session_service.update_session(
            session_id, status=SessionStatus.ERROR, error_message=str(e)
        )
