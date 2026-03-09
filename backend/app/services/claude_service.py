import anthropic
import base64
import json
import re
from pathlib import Path
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are an experienced wound care specialist and clinical nurse practitioner
with 20+ years of experience assessing all types of wounds. You are conducting a clinical
encounter and reviewing a wound image. Provide a thorough, evidence-based wound assessment.

IMPORTANT: You are an AI assistant. This assessment is for informational purposes only
and must always be confirmed by a licensed healthcare provider before any clinical decisions.

Respond ONLY with valid JSON matching the exact structure requested. No markdown, no preamble."""

USER_PROMPT = """Please analyze this wound image and provide a comprehensive clinical assessment.
Return ONLY a JSON object with this exact structure:
{
  "woundType": "string - specific wound type/classification",
  "probableCause": "string - most likely etiology",
  "estimatedDimensions": {
    "lengthCm": "string e.g. ~3-4 cm (visual estimate)",
    "widthCm": "string",
    "depthCm": "string",
    "note": "string - caveat about visual-only estimation"
  },
  "woundDepth": "superficial|partial_thickness|full_thickness|unknown",
  "woundStage": "string or null - staging if applicable (e.g. Stage II, Wagner Grade 2)",
  "woundBed": "string - describe tissue visible in wound bed",
  "exudate": {
    "amount": "none|scant|moderate|heavy",
    "type": "string - serous/purulent/serosanguineous/etc"
  },
  "periwoundSkin": "string - describe surrounding skin condition",
  "infectionSigns": ["list of observed infection indicators"],
  "diagnosis": "string - formal clinical impression",
  "differentialDiagnosis": ["list of 2-3 alternative diagnoses to consider"],
  "severity": "mild|moderate|severe|critical",
  "healingPhase": "inflammatory|proliferative|remodeling|chronic|unknown",
  "immediateActions": ["list of immediate care steps"],
  "dressingSuggestions": ["list of appropriate dressing types/products"],
  "referralRecommendations": ["list of specialists or services to refer to if needed"],
  "followUpTimeline": "string - recommended follow-up schedule",
  "additionalWorkup": ["list of labs, imaging, or tests to consider"],
  "redFlags": ["list of warning signs that require urgent escalation"],
  "disclaimer": "AI-generated assessment. Must be reviewed and confirmed by a licensed healthcare provider before any clinical action."
}"""

def _media_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(ext, "image/jpeg")

def analyze_wound_image_from_bytes(image_bytes: bytes, filename: str = "wound.jpg") -> dict:
    """Analyze wound image directly from bytes — no local file needed."""
    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
    media_type = _media_type(filename)

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                    {"type": "text", "text": USER_PROMPT},
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'```$', '', raw).strip()
    return json.loads(raw)
