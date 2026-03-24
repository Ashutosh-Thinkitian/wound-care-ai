import google.generativeai as genai
import base64
import json
import re
from pathlib import Path
from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

SYSTEM_PROMPT = """You are an experienced wound care specialist and clinical nurse practitioner with 20+ years of experience assessing all types of wounds. You are conducting a clinical encounter and reviewing a wound image. Provide a thorough, evidence-based wound assessment.

IMPORTANT: You are an AI assistant. This assessment is for informational purposes only and must always be confirmed by a licensed healthcare provider before any clinical decisions.

Respond ONLY with valid JSON matching the exact structure requested. No markdown fences, no preamble, no explanation — pure raw JSON only."""

USER_PROMPT = """Analyze this wound image and return ONLY a raw JSON object with no markdown, no backticks, no explanation. Use exactly this structure:
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
    ext = Path(filename).suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".heic": "image/heic",
    }.get(ext, "image/jpeg")

def analyze_wound_image_from_bytes(image_bytes: bytes, filename: str = "wound.jpg") -> dict:
    print("🔍 Gemini API call starting...")

    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )

    image_part = {
        "inline_data": {
            "mime_type": _media_type(filename),
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }
    }

    response = model.generate_content(
        contents=[image_part, USER_PROMPT],
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            max_output_tokens=4096,
        ),
    )

    raw = response.text.strip()
    print(f"✅ Gemini response received ({len(raw)} chars)")

    raw = re.sub(r'^```json\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'^```\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'```$', '', raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(raw)
        print("✅ JSON parsed successfully")
        return result
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\nRaw response preview: {raw[:500]}")
