# AI Assessment

## Overview

WoundCare AI uses Google Gemini 2.5 Flash as its vision AI engine to analyze wound images and produce structured clinical assessments. Gemini 2.5 Flash was chosen for its free-tier availability, native vision capability, fast inference speed (typically 15-30 seconds per analysis), and reliable structured JSON output that can be parsed programmatically without manual post-processing. The general approach sends base64-encoded image bytes alongside a detailed structured prompt to the Gemini API, which returns a raw JSON object containing 20+ clinical data points covering wound classification, dimensions, infection indicators, treatment recommendations, and urgency flags.

---

## Model Configuration

| Parameter | Value | Reason |
|-----------|-------|--------|
| Model | `gemini-2.5-flash-preview-04-17` | Latest flash model with vision capability |
| Temperature | `0.2` | Low temperature for consistent clinical output |
| Max output tokens | `4096` | Sufficient for complete structured assessment |
| Response format | Raw JSON only | Enables reliable programmatic parsing |

---

## Assessment Fields

| Field | Type | Clinical Meaning | Example Value |
|-------|------|-----------------|---------------|
| `woundType` | string | Specific wound classification | Diabetic foot ulcer Stage III |
| `probableCause` | string | Most likely etiology | Peripheral neuropathy with repetitive pressure |
| `estimatedDimensions.lengthCm` | string | Visual length estimate | ~4-5 cm (visual estimate) |
| `estimatedDimensions.widthCm` | string | Visual width estimate | ~3-4 cm (visual estimate) |
| `estimatedDimensions.depthCm` | string | Visual depth estimate | ~0.5 cm (visual estimate) |
| `estimatedDimensions.note` | string | Caveat on visual measurement | Dimensions are visual estimates only |
| `woundDepth` | enum | Tissue layer involvement | `partial_thickness` |
| `woundStage` | string or null | Formal staging if applicable | Stage II or Wagner Grade 2 |
| `woundBed` | string | Tissue visible in wound bed | Granulation tissue with 30% slough |
| `exudate.amount` | enum | Drainage volume | `moderate` |
| `exudate.type` | string | Drainage character | serosanguineous |
| `periwoundSkin` | string | Surrounding skin condition | Erythema extending 2cm, maceration present |
| `infectionSigns` | string array | Observed infection indicators | Purulent exudate, periwound warmth, odour |
| `diagnosis` | string | Formal clinical impression | Infected partial-thickness pressure injury Stage II |
| `differentialDiagnosis` | string array | Alternative diagnoses | Contact dermatitis, Venous stasis ulcer |
| `severity` | enum | Overall clinical severity | `severe` |
| `healingPhase` | enum | Current healing stage | `inflammatory` |
| `immediateActions` | string array | Priority care steps | Wound cleansing with saline, debridement |
| `dressingSuggestions` | string array | Recommended products | Silver alginate primary dressing |
| `referralRecommendations` | string array | Specialist referrals | Wound care specialist, vascular surgery |
| `followUpTimeline` | string | Reassessment schedule | Reassess in 24-48 hours |
| `additionalWorkup` | string array | Diagnostic tests | HbA1c, wound swab culture, ankle-brachial index |
| `redFlags` | string array | Urgent escalation signs | Rapidly spreading erythema, systemic fever |
| `disclaimer` | string | Legal disclaimer | AI-generated — must be confirmed by licensed provider |

---

## Prompt Engineering Approach

The system prompt establishes the AI persona as an experienced wound care specialist and clinical nurse practitioner with 20+ years of experience assessing all types of wounds. This persona framing encourages the model to produce clinically grounded, evidence-based assessments using appropriate medical terminology rather than generic or lay descriptions. The prompt also explicitly states that the assessment is for informational purposes only and must always be confirmed by a licensed healthcare provider, ensuring the disclaimer context is embedded at the instruction level.

The user prompt requests raw JSON only with no markdown fences, no backticks, and no preamble or explanation text. It provides the exact JSON structure with field names, types, and descriptions inline so that Gemini returns a response that maps directly to the `WoundAssessmentResponse` Pydantic schema on the backend and the `WoundAssessment` TypeScript interface on the frontend. This structured prompting approach eliminates the need for complex response parsing or field extraction logic.

Temperature is set to 0.2 to minimise hallucination and produce consistent clinical terminology across assessments. A low temperature reduces the randomness in the model's output, making wound classifications, severity levels, and treatment recommendations more deterministic and reproducible. This is critical in a clinical context where the same wound image should produce substantially similar assessments across repeated analyses.

Markdown fence stripping with regex is applied to the raw response text before `JSON.parse` as a safety measure in case the model adds backtick code fences despite the "no markdown" instruction. Three regex passes remove leading ` ```json ` markers, standalone ` ``` ` markers, and trailing ` ``` ` markers. This defensive parsing ensures the pipeline does not break if the model occasionally wraps its JSON output in code fences, which is a known behavior with instruction-following models.

---

## Severity Levels

| Level | UI Color | Clinical Meaning | Typical Examples |
|-------|----------|-----------------|------------------|
| `mild` | Green | Minor wound with low infection risk | Small superficial abrasion, minor skin tear |
| `moderate` | Amber | Wound requiring active management | Partial thickness pressure injury, venous ulcer |
| `severe` | Orange | Complex wound with complication risk | Deep diabetic ulcer, infected surgical wound |
| `critical` | Red | Urgent wound requiring immediate escalation | Necrotizing fasciitis signs, septic wound |

---

## Healing Phases

| Phase | Typical Duration | Key Characteristics | Visual Signs |
|-------|-----------------|-------------------|-------------|
| `inflammatory` | Days 1-4 | Vasodilation, immune response | Redness, warmth, swelling, exudate |
| `proliferative` | Days 4-21 | Granulation and angiogenesis | Pink granulation tissue, wound contraction |
| `remodeling` | 21 days to 2 years | Collagen remodeling | Scar formation, strength restoration |
| `chronic` | Greater than 4 weeks | Stalled healing | Slough, biofilm, wound not reducing in size |

---

## Limitations and Disclaimer

WoundCare AI provides AI-generated wound assessments that are subject to the following limitations. All outputs are intended as clinical decision support and must never be used as the sole basis for treatment decisions.

- **Visual-only assessment.** The AI analyzes a single photograph without any physical examination. It cannot palpate tissue, assess wound depth by probing, detect temperature differences, or evaluate pain response. Subsurface conditions such as tunneling, undermining, or deep tissue involvement may not be visible in the image.

- **Approximate dimension estimates.** Wound dimensions (length, width, depth) are visual estimates derived from the image without physical measurement tools. These estimates should not be used for clinical documentation or wound measurement tracking. Accurate measurements require a ruler or wound measurement device at the bedside.

- **Image quality dependency.** Assessment accuracy is directly affected by lighting conditions, camera angle, image resolution, focus quality, and colour accuracy of the capturing device. Poor lighting, motion blur, extreme angles, or low-resolution images may lead to inaccurate or incomplete assessments.

- **AI cannot replace clinical judgement.** The Gemini model may produce incorrect classifications, miss subtle clinical signs, or generate inappropriate treatment recommendations. The model has no access to patient history, medication lists, allergies, comorbidities, or prior wound assessments — all of which are essential for comprehensive wound management.

- **Mandatory provider review.** All assessments generated by WoundCare AI must be reviewed and confirmed by a licensed healthcare provider before any clinical action is taken. The AI-generated disclaimer is included in every assessment report and PDF export: *"AI-generated assessment. Must be reviewed and confirmed by a licensed healthcare provider before any clinical action."*
