# Features

WoundCare AI is built around 8 core features that together create a complete wound assessment workflow.

---

## Feature 1 — New Encounter Creation

Provider clicks **Start Encounter** on the dashboard and optionally enters a patient reference such as a room number or case ID. A new session is created in Supabase Postgres with status `PENDING` and an expiration time based on the configured `SESSION_TTL_MINUTES`. The provider is immediately navigated to the Session page where the QR code is displayed.

### User Flow

1. Provider opens the Dashboard (`/`)
2. Clicks the **Start Encounter** button
3. `NewEncounterDialog` opens with a patient reference input field
4. Optionally enters a patient reference (e.g. "Room 12B", "Case #4421")
5. Clicks **Generate QR Code**
6. `POST /api/v1/sessions` is called with `{ patientRef }` body
7. Provider is navigated to `/session/:id`

### Key Components

**Frontend:**
- `src/pages/DashboardPage.tsx` — renders the Start Encounter button and manages dialog state
- `src/components/wound/NewEncounterDialog.tsx` — Radix Dialog with patient reference input and Generate QR Code button
- `src/hooks/useCreateSession.ts` — calls `sessionsApi.create()` and navigates on success

**Backend:**
- `app/api/v1/endpoints/sessions.py` — `POST ""` endpoint that accepts `CreateSessionRequest`
- `app/services/session_service.py` — `create_session(patient_ref)` creates `SessionDB` with `PENDING` status and TTL

> **Screenshot placeholder:** [Dashboard page showing the Start Encounter button and the NewEncounterDialog open with a patient reference field and Generate QR Code button]

---

## Feature 2 — QR Code Generation and Mobile Capture

The Session page displays a QR code encoding the `/capture/:sessionId` URL pointing to the frontend. A patient or bedside clinician scans this QR code with their phone camera and is taken directly to the mobile capture page in their browser. No app installation is required — it works on iOS Safari and Android Chrome as a standard web page.

### User Flow

1. Provider sees the QR code on the Session page (`/session/:id`)
2. Patient scans the QR code with their phone camera
3. Mobile browser opens `/capture/:sessionId`
4. `MobileCapturePage` validates the session exists and is in `PENDING` status
5. Patient takes a photo using the camera or uploads an image from their gallery
6. Image is submitted to the backend via `POST /api/v1/capture/:sessionId`

### Key Components

**Frontend:**
- `src/pages/SessionPage.tsx` — renders the QR Code tab with `QRCodeDisplay` and session status
- `src/components/qr/QRCodeDisplay.tsx` — generates and displays the QR code using `qrcode.react`
- `src/pages/MobileCapturePage.tsx` — mobile-optimized capture page with camera and gallery upload
- `src/hooks/useMobileCapture.ts` — manages camera capture workflow and image submission

**Backend:**
- `app/api/v1/endpoints/sessions.py` — `GET "/{session_id}/status"` endpoint used for polling
- `app/api/v1/endpoints/capture.py` — `POST "/{session_id}"` accepts the uploaded image file

> **Screenshot placeholder:** [Session page showing the QR Code tab with a rendered QR code, session status badge, and expiration countdown timer]

---

## Feature 3 — Provider Direct Upload

Providers can bypass the QR code flow entirely and upload a wound image directly from the Session page on their desktop. The **Upload Directly** tab accepts drag-and-drop or click-to-browse file selection with image preview before submission. Supported file types are JPEG, PNG, WebP, and HEIC up to 10 MB.

### User Flow

1. Provider clicks the **Upload Directly** tab on the Session page
2. Drags an image file onto the drop zone or clicks to browse files
3. Image preview is shown before submission
4. Provider clicks **Submit for AI Analysis**
5. Image is uploaded to the backend via `POST /api/v1/capture/:sessionId`

### Key Components

**Frontend:**
- `src/pages/SessionPage.tsx` — renders the Radix Tabs with QR Code and Upload Directly tabs
- `src/components/wound/ProviderUpload.tsx` — drag-and-drop upload component using `react-dropzone` with image preview
- `src/hooks/useImageUpload.ts` — calls `captureApi.uploadImage()` with the selected file

**Backend:**
- `app/api/v1/endpoints/capture.py` — `POST "/{session_id}"` validates file type and size, uploads to Supabase Storage
- `app/services/storage_service.py` — `upload_wound_image()` stores the image in the `wound-images` bucket

> **Screenshot placeholder:** [Session page showing the Upload Directly tab with a drag-and-drop zone and an image preview ready for submission]

---

## Feature 4 — Real-time Session Status and Timeline

The Session page polls the backend every 3 seconds using `GET /api/v1/sessions/:id/status` and updates the Encounter Status timeline in real time. A 4-step visual timeline tracks progress from Encounter Created through Image Received, AI Analysis, and Assessment Ready. When the status becomes `complete`, the page auto-navigates to the assessment report after 1.5 seconds with a success flash animation.

### User Flow

1. Session page starts polling `GET /api/v1/sessions/:id/status` every 3 seconds via `useSession` hook
2. `SessionTimeline` component updates as status changes through each step
3. During `ANALYZING` status, `AnalysisProgress` shows a progress bar and rotating clinical analysis step labels
4. `PulsingCard` wraps the analysis panel with a pulsing border animation
5. On `complete` status, a green success callout appears and auto-navigates to `/assessment/:assessmentId` after 1.5 seconds

### Key Components

**Frontend:**
- `src/pages/SessionPage.tsx` — orchestrates polling, countdown timer, status transitions, and auto-navigation
- `src/components/wound/SessionTimeline.tsx` — 4-step visual timeline showing session progress
- `src/components/common/AnalysisProgress.tsx` — animated progress indicator with rotating clinical step labels during analysis
- `src/components/common/PulsingCard.tsx` — card with pulsing border animation for the analyzing state
- `src/hooks/useSession.ts` — polls every 3 seconds, stops on `complete` or `error`, triggers auto-navigation after 1.5s

**Backend:**
- `app/api/v1/endpoints/sessions.py` — `GET "/{session_id}/status"` returns current session state

> **Screenshot placeholder:** [Session page during AI analysis showing the pulsing card with MagicWand icon, progress bar, rotating analysis step, and the 4-step timeline on the right]

---

## Feature 5 — AI Wound Analysis

After image upload, the backend stores the image in Supabase Storage then sends the raw image bytes to Google Gemini 2.5 Flash via the Vision API. Gemini returns a structured JSON clinical assessment covering 20+ fields including wound type, dimensions, tissue composition, infection indicators, and treatment recommendations. The analysis runs as a FastAPI background task via `asyncio.create_task` so the HTTP response returns immediately to the client.

### User Flow

1. Image bytes received via `POST /api/v1/capture/:id`
2. `storage_service.upload_wound_image()` uploads to Supabase Storage and returns the public URL
3. Session status updated to `IMAGE_RECEIVED`
4. Background task `_run_analysis()` triggered via `asyncio.create_task`
5. Session status updated to `ANALYZING`
6. `gemini_service.analyze_wound_image_from_bytes()` sends image bytes to Gemini 2.5 Flash
7. Structured JSON response parsed and validated
8. `store_assessment()` saves the result to Supabase Postgres `assessments` table
9. Session status updated to `COMPLETE` with `assessment_id` linked

### Key Components

**Frontend:**
- `src/components/common/AnalysisProgress.tsx` — shows rotating clinical analysis steps while the backend processes

**Backend:**
- `app/api/v1/endpoints/capture.py` — `_run_analysis()` background task that orchestrates the full pipeline
- `app/services/gemini_service.py` — `analyze_wound_image_from_bytes()` sends image to Gemini and returns structured JSON
- `app/services/storage_service.py` — `upload_wound_image()` stores image in Supabase Storage
- `app/api/v1/endpoints/assessments.py` — `store_assessment()` persists the assessment result to Postgres

> **Screenshot placeholder:** [Backend console logs showing the capture flow: file received, image uploaded to Supabase, status transitions through ANALYZING to COMPLETE]

---

## Feature 6 — Clinical Assessment Report

The Assessment Result page renders the full Gemini-generated clinical report in a structured two-column layout. The left column shows the wound image from Supabase Storage, clinical diagnosis with probable cause and differential diagnoses, wound characteristics (type, depth, stage, healing phase, exudate, wound bed, periwound skin), estimated dimensions with a measurement note, and infection assessment. The right column shows immediate actions, dressing recommendations, follow-up timeline, referral recommendations, and additional workup. A red flags banner appears prominently at the top when urgent signs are detected.

### User Flow

1. Auto-navigated from Session page after analysis completes, or accessed directly via `/assessment/:assessmentId`
2. `GET /api/v1/assessments/:id` called to fetch the full assessment
3. Full report rendered in two-column grid layout
4. Red flags banner shown prominently at the top if urgent signs are present
5. Provider reviews all clinical sections from wound characteristics through treatment recommendations
6. AI disclaimer displayed at the bottom of the report

### Key Components

**Frontend:**
- `src/pages/AssessmentResultPage.tsx` — full report page with two-column layout, red flags banner, wound image, and all clinical sections
- `src/hooks/useAssessment.ts` — fetches assessment data by ID from the API
- `src/components/common/SeverityBadge.tsx` — color-coded severity badge (e.g. Mild, Moderate, Severe)

**Backend:**
- `app/api/v1/endpoints/assessments.py` — `GET "/{assessment_id}"` returns flattened assessment with JSONB result fields merged into the response

> **Screenshot placeholder:** [Assessment result page showing the two-column layout with wound image, clinical diagnosis, wound characteristics on the left, and immediate actions, dressing recommendations on the right, with a red flags banner at the top]

---

## Feature 7 — PDF Export

Providers can export the assessment report as a clinical PDF directly from the browser using `window.print()`. The `document.title` is set to `WoundCare AI_{patientRef}` before printing so the browser uses this as the default save filename (falling back to the first 8 characters of the session ID if no patient reference exists). A dedicated print stylesheet in `print.css` hides navigation, sidebar, and action buttons while formatting the report as a clean A4 clinical document with a print-only header.

### User Flow

1. Provider clicks the **Export PDF** button on the assessment report page
2. `document.title` is set to `WoundCare AI_{patientRef}` (or `WoundCare AI_{sessionId_prefix}`)
3. `window.print()` is called to open the browser print dialog
4. Print stylesheet hides navigation elements and formats the report for A4 paper
5. A print-only header appears with "WoundCare AI — AI-Assisted Wound Assessment Report" branding
6. Provider selects **Save as PDF** in the print dialog
7. PDF is saved with the clinical filename
8. `document.title` is restored to "WoundCare AI" after 2 seconds

### Key Components

**Frontend:**
- `src/pages/AssessmentResultPage.tsx` — `handlePrint()` function that sets title and triggers `window.print()`
- `src/styles/print.css` — print media query stylesheet that hides `.no-print` elements, shows `.print-header`, and formats for A4

> **Screenshot placeholder:** [Browser print dialog showing the assessment report formatted as a clean clinical PDF with the WoundCare AI header and the filename set to WoundCare AI_Room12B.pdf]

---

## Feature 8 — Session History and Dashboard

The Sessions page shows all past encounters in a table with columns for Patient Ref, Status, Created, Expires, and Actions. Status badges are color-coded by state and action buttons are context-aware — **View Report** for completed sessions, **View Session** for in-progress sessions, **Open QR** for pending sessions, and a red **Failed** badge for errored sessions. The Dashboard shows the 3 most recent sessions and a 4-card stats row with Total Encounters, Completed, In Progress, and Failed counts. All data is persisted in Supabase Postgres and survives backend restarts.

### User Flow

1. Provider clicks **Sessions** in the sidebar navigation
2. `GET /api/v1/sessions` returns all sessions ordered newest first
3. 4-card stats row renders with Total Encounters, Completed, In Progress, and Failed counts
4. Full sessions table rendered with status badges and expiration indicators
5. **View Report** button navigates to `/assessment/:id` for completed sessions
6. **View Session** button navigates to `/session/:id` for in-progress sessions
7. **Open QR** button navigates to `/session/:id` for pending sessions

### Key Components

**Frontend:**
- `src/pages/SessionsPage.tsx` — full sessions table with stats row, status badges, expiration badges, and context-aware action buttons
- `src/pages/DashboardPage.tsx` — dashboard with 3 most recent sessions table and 4-card encounter stats row
- `src/hooks/useSessions.ts` — fetches all sessions via `sessionsApi.list()`
- `src/components/common/StatusBadge.tsx` — color-coded status badge component

**Backend:**
- `app/api/v1/endpoints/sessions.py` — `GET ""` endpoint that lists all sessions newest first
- `app/services/session_service.py` — `list_sessions()` queries all `SessionDB` rows ordered by `created_at` descending

> **Screenshot placeholder:** [Sessions page showing the 4-card stats row at the top and the full sessions table below with mixed status badges, expiration dates, and context-aware action buttons]
