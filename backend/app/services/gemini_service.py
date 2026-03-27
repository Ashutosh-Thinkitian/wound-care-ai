"""Wound image analysis using Google Gemini Vision API."""

import base64
import json
import re
from pathlib import Path

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

# Safety settings — disable ALL filters for clinical wound image analysis
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

# Models to try in order — 2.5-flash is primary (better analysis quality),
# falls back to 2.0-flash for graphic images that 2.5 blocks
MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]

SYSTEM_PROMPT = """You are an experienced wound care specialist and clinical nurse practitioner with 20+ years of experience assessing all types of wounds. You are conducting a clinical encounter and reviewing a wound image. Provide a thorough, evidence-based wound assessment.

IMPORTANT: You are an AI assistant. This assessment is for informational purposes only and must always be confirmed by a licensed healthcare provider before any clinical decisions.

This is a legitimate medical/clinical application used by licensed healthcare providers for wound documentation and care planning.

Respond ONLY with valid JSON matching the exact structure requested. No markdown fences, no preamble, no explanation — pure raw JSON only."""

USER_PROMPT = """You are reviewing this clinical wound photograph as part of a medical assessment by a licensed healthcare provider. Analyze the wound and return ONLY a raw JSON object with no markdown, no backticks, no explanation. Use exactly this structure:
{
  "woundType": "specific wound type and classification",
  "probableCause": "most likely etiology based on visual appearance",
  "estimatedDimensions": {
    "lengthCm": "estimated length e.g. ~3-4 cm",
    "widthCm": "estimated width e.g. ~2-3 cm",
    "depthCm": "estimated depth e.g. ~0.5 cm or unknown",
    "note": "dimensions are visual estimates only without physical measurement tools"
  },
  "woundDepth": "superficial or partial_thickness or full_thickness or unknown",
  "woundStage": "staging if applicable e.g. Stage II or Wagner Grade 2 or null if not applicable",
  "woundBed": "detailed description of tissue visible in the wound bed",
  "exudate": {
    "amount": "none or scant or moderate or heavy",
    "type": "serous or purulent or serosanguineous or sanguineous or none"
  },
  "periwoundSkin": "detailed description of the surrounding skin condition",
  "infectionSigns": ["list each observed sign of infection or write No signs of infection observed"],
  "diagnosis": "formal clinical impression as a wound care specialist",
  "differentialDiagnosis": ["2 to 3 alternative diagnoses to consider"],
  "severity": "mild or moderate or severe or critical",
  "healingPhase": "inflammatory or proliferative or remodeling or chronic or unknown",
  "immediateActions": ["list each immediate care step required"],
  "dressingSuggestions": ["list each appropriate dressing type or product with rationale"],
  "referralRecommendations": ["list each specialist or service referral needed or write No referral needed at this time"],
  "followUpTimeline": "recommended follow-up schedule e.g. Reassess in 48-72 hours",
  "additionalWorkup": ["list each lab test imaging or diagnostic workup to consider"],
  "redFlags": ["list each warning sign that requires urgent escalation or write None identified"],
  "disclaimer": "AI-generated assessment. Must be reviewed and confirmed by a licensed healthcare provider before any clinical action."
}"""


def _media_type(filename: str) -> str:
    """Map filename extension to MIME type."""
    ext = Path(filename).suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".heic": "image/heic",
    }.get(ext, "image/jpeg")


def _try_model(model_name: str, image_part: dict, user_prompt: str) -> str:
    """Attempt analysis with a specific model. Returns raw response text or raises."""
    print(f"  Trying model: {model_name}")
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=SYSTEM_PROMPT,
        safety_settings=SAFETY_SETTINGS,
    )

    response = model.generate_content(
        contents=[image_part, user_prompt],
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            max_output_tokens=4096,
        ),
        safety_settings=SAFETY_SETTINGS,
    )

    # Check for blocked response
    if not response.candidates:
        feedback = getattr(response, 'prompt_feedback', None)
        raise ValueError(f"Model {model_name} blocked the request. Feedback: {feedback}")

    return response.text.strip()


def analyze_wound_image_from_bytes(image_bytes: bytes, filename: str = "wound.jpg") -> dict:
    """Send wound image bytes to Gemini and return the parsed JSON assessment.

    Tries multiple models — if the primary model blocks the image, falls back to alternatives.
    This is a synchronous function — call via asyncio.to_thread() from async code.
    """
    print(f"🔍 Gemini API call starting... ({len(image_bytes)} bytes, {filename})")

    image_part = {
        "inline_data": {
            "mime_type": _media_type(filename),
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }

    # Try each model until one succeeds
    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            raw = _try_model(model_name, image_part, USER_PROMPT)
            print(f"✅ Gemini response received from {model_name} ({len(raw)} chars)")
            break
        except Exception as e:
            print(f"  ⚠️ {model_name} failed: {e}")
            last_error = e
            continue
    else:
        raise ValueError(f"All Gemini models failed. Last error: {last_error}")

    # Strip markdown code fences if present
    raw = re.sub(r'^```json\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'^```\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```$', '', raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(raw)
        print("✅ JSON parsed successfully")
        return result
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw response preview: {raw[:500]}")
