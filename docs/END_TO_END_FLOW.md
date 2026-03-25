# End-to-End Flow

## Overview

The WoundCare AI workflow begins when a healthcare provider creates a new encounter on the dashboard, generating a QR code that a patient scans to capture a wound image on their mobile device, which is then analyzed by Google Gemini 2.5 Flash to produce a structured clinical assessment. The provider's desktop session polls for completion in real time, auto-navigates to the assessment report once analysis finishes, and allows the provider to export the report as a clinical PDF with the patient reference as the filename.

---

## Complete Sequence Diagram

```
Provider          Frontend           Backend          Gemini AI        Supabase
   │                  │                  │                │                │
   │  Click Start     │                  │                │                │
   │─────────────────►│                  │                │                │
   │                  │ POST /sessions   │                │                │
   │                  │─────────────────►│                │                │
   │                  │                  │ INSERT session  │                │
   │                  │                  │────────────────────────────────►│
   │                  │  {id, qrUrl}     │                │                │
   │                  │◄─────────────────│                │                │
   │  QR Code shown   │                  │                │                │
   │◄─────────────────│                  │                │                │
   │                  │                  │                │                │
   │       [Patient scans QR on mobile]  │                │                │
   │                  │                  │                │                │
Patient            Mobile               │                │                │
   │  Open /capture   │                  │                │                │
   │─────────────────►│                  │                │                │
   │                  │ GET /status      │                │                │
   │                  │─────────────────►│                │                │
   │  Capture UI      │                  │                │                │
   │◄─────────────────│                  │                │                │
   │  Take photo      │                  │                │                │
   │─────────────────►│                  │                │                │
   │                  │ POST /capture    │                │                │
   │                  │─────────────────►│                │                │
   │                  │                  │ Upload image   │                │
   │                  │                  │────────────────────────────────►│
   │                  │                  │  public URL    │                │
   │                  │                  │◄────────────────────────────────│
   │                  │                  │ Send to Gemini │                │
   │                  │                  │───────────────►│                │
   │                  │                  │  JSON result   │                │
   │                  │                  │◄───────────────│                │
   │                  │                  │ INSERT assessment               │
   │                  │                  │────────────────────────────────►│
   │  Success screen  │                  │                │                │
   │◄─────────────────│                  │                │                │
   │                  │                  │                │                │
Provider           Desktop              │                │                │
   │  Polling status  │                  │                │                │
   │◄─────────────────│ GET /status ────►│                │                │
   │  Status complete │                  │                │                │
   │  Auto-navigate   │                  │                │                │
   │─────────────────►│ GET /assessment ►│                │                │
   │  View report     │◄─────────────────│                │                │
   │◄─────────────────│                  │                │                │
   │  Export PDF      │                  │                │                │
   │─────────────────►│ window.print()   │                │                │
```

---

## Phase 1 — Encounter Creation

The provider clicks **Start Encounter** on the Dashboard, which opens the `NewEncounterDialog`. The dialog accepts an optional patient reference (e.g. "Room 12B" or "Case #4421") and features a **Generate QR Code** button. On submit, the `useCreateSession` hook calls `POST /api/v1/sessions` with `{ patientRef }`.

On the backend, `session_service.create_session()` generates a UUID, sets the initial status to `PENDING`, calculates `expires_at` from the current UTC time plus `SESSION_TTL_MINUTES` (default 30 minutes), and inserts the record into the Supabase Postgres `sessions` table via SQLAlchemy ORM.

The backend returns a `SessionResponse` containing the session `id`, `status`, `createdAt`, `expiresAt`, and a `qrUrl` constructed as `{FRONTEND_URL}/capture/{session_id}`. The frontend receives this response and immediately navigates to `/session/:id` where the QR code is rendered.

**Files involved:**
- `frontend/src/pages/DashboardPage.tsx` — Start Encounter button and dialog trigger
- `frontend/src/components/wound/NewEncounterDialog.tsx` — patient reference input dialog
- `frontend/src/hooks/useCreateSession.ts` — API call and navigation
- `frontend/src/services/api.ts` — `sessionsApi.create()` HTTP client
- `backend/app/api/v1/endpoints/sessions.py` — `POST ""` endpoint
- `backend/app/schemas/session.py` — `CreateSessionRequest` and `SessionResponse`
- `backend/app/services/session_service.py` — `create_session()` with SQLAlchemy
- `backend/app/models/db_models.py` — `SessionDB` ORM model

**Data created in Supabase:**

| Field | Value |
|-------|-------|
| `id` | UUID v4 string |
| `status` | `pending` |
| `patient_ref` | User input or `NULL` |
| `image_url` | `NULL` |
| `assessment_id` | `NULL` |
| `error_message` | `NULL` |
| `created_at` | Current UTC timestamp |
| `expires_at` | Current UTC + SESSION_TTL_MINUTES |

---

## Phase 2 — QR Scan and Mobile Capture

The provider's Session page displays a QR code encoding the URL `{FRONTEND_URL}/capture/{sessionId}` via the `QRCodeDisplay` component (using `qrcode.react`). A patient or bedside clinician scans this QR code with their phone camera, and the mobile browser opens the capture URL directly — no app installation required.

**Mobile device flow:**

1. `MobileCapturePage` mounts and the `useMobileCapture` hook enters the `validating` state, calling `GET /api/v1/sessions/:id/status` to verify the session exists and is in `PENDING` status.
2. If the session is not found, the page shows an "Invalid Session" error. If the session has already received an image (`IMAGE_RECEIVED`, `ANALYZING`, or `COMPLETE`), it shows "Image Already Received". If the session's `expires_at` has passed, it shows "Session Expired".
3. If validation succeeds, the page enters the `idle` state showing two capture buttons: **Take Photo** (opens the device camera with `capture="environment"`) and **Upload from Gallery** (opens the file picker).
4. After selecting or capturing an image, the page enters the `preview` state showing the image with file name and size, a **Retake** button, and a **Submit** button.
5. On submit, the hook calls `POST /api/v1/capture/:sessionId` with the image as `FormData`. The page enters the `uploading` state with an animated overlay on the preview.
6. On success, the page transitions to the `success` state showing a green checkmark, "Image Uploaded!" confirmation, rotating analysis progress steps, and a note that the provider will be notified automatically.

**Backend validation on `POST /capture/:id`:**
- Session must exist (404 if not found)
- Session status must be `PENDING` (400 "Session already has an image" otherwise)
- File MIME type must be in `{image/jpeg, image/png, image/webp, image/heic}` (400 if unsupported)
- File size must be under 10 MB (400 if too large)

**Files involved:**
- `frontend/src/pages/MobileCapturePage.tsx` — mobile capture UI with 8 states (validating, idle, preview, uploading, success, already_used, expired, invalid)
- `frontend/src/hooks/useMobileCapture.ts` — state machine and API calls
- `frontend/src/components/common/AnalysisProgress.tsx` — rotating step labels on success screen
- `backend/app/api/v1/endpoints/capture.py` — file validation and upload endpoint
- `backend/app/api/v1/endpoints/sessions.py` — status polling endpoint for validation

---

## Phase 3 — AI Analysis Pipeline

After the image passes validation in the capture endpoint, the backend executes the following pipeline. The HTTP response `{"message": "Image received. Analysis in progress."}` returns immediately — the analysis runs as a background task via `asyncio.create_task`.

### Step 1 — Upload to Supabase Storage

`storage_service.upload_wound_image()` takes the raw image bytes, original filename, and session ID. It generates a storage path in the format `wounds/{session_id}/{uuid_hex}.{ext}` (e.g. `wounds/abc123/d4e5f6a7.jpg`) and uploads the file to the `wound-images` Supabase Storage bucket. It returns the public URL for the uploaded image.

Session status is updated to `IMAGE_RECEIVED` and the `image_url` field is set to the public URL.

### Step 2 — Gemini API Call

The `_run_analysis()` background task updates the session status to `ANALYZING`, then calls `gemini_service.analyze_wound_image_from_bytes()` via `asyncio.to_thread()` (since the Gemini SDK is synchronous).

The Gemini service:
1. Configures a `GenerativeModel` with model `gemini-2.5-flash` and a system prompt defining the AI as a wound care specialist
2. Base64-encodes the image bytes and constructs an `inline_data` part with the correct MIME type
3. Sends the image and a user prompt requesting structured JSON output to the Gemini API with `temperature=0.2` and `max_output_tokens=4096`
4. Strips any markdown code fences from the response text
5. Parses the raw text as JSON and returns the result dictionary

The JSON result contains 20+ fields: `woundType`, `probableCause`, `estimatedDimensions`, `woundDepth`, `woundStage`, `woundBed`, `exudate`, `periwoundSkin`, `infectionSigns`, `diagnosis`, `differentialDiagnosis`, `severity`, `healingPhase`, `immediateActions`, `dressingSuggestions`, `referralRecommendations`, `followUpTimeline`, `additionalWorkup`, `redFlags`, and `disclaimer`.

### Step 3 — Store Assessment

`store_assessment()` in the assessments endpoint creates an `AssessmentDB` record with a new UUID, the session ID, the public image URL, the patient reference (copied from the session), the current UTC timestamp as `analyzed_at`, and the full Gemini JSON result stored in a JSONB column.

### Step 4 — Update Session Status

The session is updated to `COMPLETE` with the `assessment_id` field set to the new assessment's UUID. If any step fails (storage upload, Gemini call, JSON parsing, or database insert), the session status is set to `ERROR` and the `error_message` field is populated with the exception message.

**Files involved:**
- `backend/app/api/v1/endpoints/capture.py` — `_run_analysis()` background task orchestrating the pipeline
- `backend/app/services/storage_service.py` — `upload_wound_image()` for Supabase Storage
- `backend/app/services/gemini_service.py` — `analyze_wound_image_from_bytes()` for Gemini Vision API
- `backend/app/api/v1/endpoints/assessments.py` — `store_assessment()` for Postgres persistence
- `backend/app/services/session_service.py` — `update_session()` for status transitions
- `backend/app/models/db_models.py` — `AssessmentDB` ORM model

---

## Phase 4 — Report Viewing and Export

### Polling and Auto-Navigation

While the analysis runs, the provider's Session page continuously polls the backend. The `useSession` hook calls `GET /api/v1/sessions/:id/status` every 3 seconds via `setInterval`. During the `ANALYZING` status, the Session page displays a `PulsingCard` with an animated progress bar and rotating clinical analysis step labels (e.g. "Identifying wound type...", "Assessing tissue condition...", "Evaluating infection risk...").

When the poll response returns `status: "complete"`, the `useSession` hook stops polling by clearing the interval. The Session page detects the transition from `analyzing` to `complete`, displays a green success callout ("Analysis complete! Loading your report..."), and triggers auto-navigation to `/assessment/:assessmentId` after a 1.5-second delay (1.8 seconds in the SessionPage transition effect, 1.5 seconds in the useSession hook — whichever fires first).

If the status becomes `error`, polling stops and the Session page displays a red error callout with the error message and a "Start New Encounter" button.

### Assessment Report Rendering

The `AssessmentResultPage` fetches the full assessment via `GET /api/v1/assessments/:assessmentId`. The backend retrieves the `AssessmentDB` record, flattens the JSONB `result` column into the response by merging it with the top-level fields (`id`, `sessionId`, `imageUrl`, `patientRef`, `analyzedAt`).

The report renders in a two-column grid layout:

**Left column:** wound image (loaded from Supabase Storage public URL), clinical diagnosis with probable cause and differential diagnoses, wound characteristics (type, depth, stage, healing phase, exudate amount/type, wound bed, periwound skin), estimated dimensions with measurement disclaimer, and infection assessment.

**Right column:** immediate actions (numbered steps), dressing recommendations (with checkmark icons), follow-up timeline, referral recommendations, and additional workup.

A red flags banner appears at the top of the report when urgent signs are detected (filtering out generic "None identified" entries). The severity badge and healing phase badge are shown in the top bar alongside the wound type and analysis date.

### PDF Export

The provider clicks **Export PDF** in the report top bar, triggering `handlePrint()`:

1. The `document.title` is set to `WoundCare AI_{patientRef}` (or `WoundCare AI_{first 8 chars of session ID}` if no patient reference exists)
2. `window.print()` opens the browser's native print dialog
3. The `print.css` stylesheet activates via `@media print`, hiding elements with the `.no-print` class (navigation, sidebar, buttons) and showing elements with the `.print-header` class (a branded header with "WoundCare AI — AI-Assisted Wound Assessment Report", wound type, analysis date, patient ref, and report ID)
4. The provider selects "Save as PDF" in the print dialog — the browser uses the document title as the default filename
5. After 2 seconds, `document.title` is restored to "WoundCare AI"

**Files involved:**
- `frontend/src/hooks/useSession.ts` — polling loop with 3-second interval, auto-navigation after 1.5 seconds
- `frontend/src/pages/SessionPage.tsx` — status timeline, analyzing animation, completion transition
- `frontend/src/components/wound/SessionTimeline.tsx` — 4-step visual progress timeline
- `frontend/src/components/common/AnalysisProgress.tsx` — progress bar and rotating step labels
- `frontend/src/components/common/PulsingCard.tsx` — animated card wrapper
- `frontend/src/pages/AssessmentResultPage.tsx` — full report rendering and `handlePrint()` PDF export
- `frontend/src/hooks/useAssessment.ts` — fetches assessment data by ID
- `frontend/src/components/common/SeverityBadge.tsx` — color-coded severity display
- `frontend/src/styles/print.css` — print media query stylesheet
- `backend/app/api/v1/endpoints/sessions.py` — status polling endpoint
- `backend/app/api/v1/endpoints/assessments.py` — assessment retrieval with JSONB flattening

---

## Data Flow Summary

| Step | Data Created | Stored In |
|------|-------------|-----------|
| 1. Session created | Session record with `PENDING` status, patient ref, expiration time | Supabase Postgres `sessions` table |
| 2. Image uploaded | Wound image file at `wounds/{session_id}/{uuid}.{ext}` | Supabase Storage `wound-images` bucket |
| 3. Analysis complete | Assessment record with full JSONB result (20+ clinical fields) | Supabase Postgres `assessments` table |
| 4. Report viewed | No new data — reads from Postgres and Storage | N/A |
| 5. PDF exported | PDF file saved via browser print dialog | Provider's local machine |
