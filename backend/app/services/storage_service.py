"""Supabase Storage integration for wound image uploads."""

import uuid
from pathlib import Path

from app.core.config import settings
from app.core.supabase_client import get_supabase

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def upload_wound_image(file_bytes: bytes, original_filename: str, session_id: str) -> str:
    """Upload wound image bytes to Supabase Storage.

    Returns the public URL of the uploaded image.
    """
    ext = Path(original_filename).suffix.lower() if original_filename else ".jpg"
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"

    object_path = f"wounds/{session_id}/{uuid.uuid4().hex}{ext}"

    supabase = get_supabase()
    supabase.storage.from_(settings.SUPABASE_WOUND_IMAGES_BUCKET).upload(
        path=object_path,
        file=file_bytes,
        file_options={"content-type": _mime(ext), "upsert": "false"},
    )

    return supabase.storage.from_(settings.SUPABASE_WOUND_IMAGES_BUCKET).get_public_url(object_path)


def _mime(ext: str) -> str:
    """Map file extension to MIME type."""
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".heic": "image/heic",
    }.get(ext, "image/jpeg")
