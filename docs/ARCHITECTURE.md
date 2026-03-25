# Architecture

## Overview

The WoundCare AI backend is built on **FastAPI**, chosen for its native async support, automatic OpenAPI documentation, and first-class Pydantic integration for request validation and response serialization. FastAPI's async capabilities are critical for the image capture workflow — when a wound image is uploaded, the server must immediately return a response to the mobile client while spawning a background task to run AI analysis via `asyncio.create_task`. Its built-in Swagger UI at `/docs` also serves as a living API reference that stays in sync with the codebase, eliminating documentation drift.

**Supabase** was selected as the unified data platform, providing both PostgreSQL database and object storage under a single managed service. The PostgreSQL database (accessed via SQLAlchemy ORM through Supabase's Session Pooler) stores session state and assessment results, while Supabase Storage handles wound image files with automatic public URL generation. This eliminates the need to provision and manage separate database and file storage infrastructure, and the built-in Row Level Security and service role key model provides a clear security boundary between client-side and server-side access.

The AI vision layer uses **Google Gemini 2.5 Flash**, chosen for its strong multimodal capabilities at low latency and cost. Gemini 2.5 Flash can analyze wound images and return structured JSON with clinical data points — wound type, dimensions, tissue composition, infection indicators, and treatment recommendations — in a single API call. On the frontend, **Radix UI Themes** provides the component system, selected for its accessibility-first design, unstyled primitive architecture that avoids CSS conflicts, and clinical-grade appearance that suits a healthcare application. Radix components like Dialog, Badge, and Card are used throughout the provider interface with a consistent blue accent and slate gray color scheme.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WOUNDCARE AI SYSTEM                         │
├───────────────────────┬─────────────────────┬───────────────────────┤
│   PROVIDER (Desktop)  │   PATIENT (Mobile)  │       BACKEND         │
│                       │                     │                       │
│  React + Radix UI     │  React + Radix UI   │  FastAPI :8000        │
│                       │  /capture/:id       │                       │
│  Dashboard            │                     │  /api/v1/sessions     │
│  Session Page + QR    │  Camera / Gallery   │  /api/v1/capture      │
│  Assessment Report    │                     │  /api/v1/assessments  │
│                       │                     │                       │
│  ── POST /sessions ───┼─────────────────────►  session_service      │
│  ── GET  /sessions ───┼─────────────────────►  session_service      │
│                       │  POST /capture/:id ─►  storage_service      │
│                       │                     │       │               │
│                       │                     │       ▼               │
│                       │                     │  Supabase Storage     │
│                       │                     │  wound-images bucket  │
│                       │                     │       │               │
│                       │                     │       ▼               │
│                       │                     │  gemini_service       │
│                       │                     │  Gemini 2.5 Flash     │
│                       │                     │       │               │
│                       │                     │       ▼               │
│                       │                     │  Supabase Postgres    │
│                       │                     │  sessions table       │
│                       │                     │  assessments table    │
└───────────────────────┴─────────────────────┴───────────────────────┘
```

## Frontend Architecture

### Page Structure and Routing

The frontend uses **React Router v6** with a flat route structure defined in `App.tsx`. Routes are split into two layout groups:

- **Provider routes** wrapped in `AppLayout` (sidebar navigation + header):
  - `/` — `DashboardPage` — home dashboard with session list and new encounter creation
  - `/sessions` — `SessionsPage` — session history with stats and past encounters
  - `/session/:sessionId` — `SessionPage` — individual session detail with QR code display, provider upload, and real-time status polling
  - `/assessment/:assessmentId` — `AssessmentResultPage` — full assessment results with PDF export

- **Mobile route** wrapped in `MobileLayout` (no sidebar, minimal chrome):
  - `/capture/:sessionId` — `MobileCapturePage` — camera/gallery image capture for patients

### Component Hierarchy

Components are organized into four directories under `src/components/`:

- **`common/`** — Reusable UI primitives: `LoadingSpinner`, `EmptyState`, `StatusBadge`, `SeverityBadge`, `AnalysisProgress`, `PulsingCard`
- **`layout/`** — Page shells: `AppLayout` (provider desktop with sidebar), `MobileLayout` (patient mobile), `PageHeader`
- **`qr/`** — `QRCodeDisplay` using `qrcode.react` to render session-specific QR codes
- **`wound/`** — Domain components: `NewEncounterDialog` (create session), `ProviderUpload` (desktop file upload via `react-dropzone`), `SessionTimeline` (event timeline)

### State Management

Global state is managed with **Zustand** via `src/store/sessionStore.ts`. The store holds a `sessions` array and exposes two actions:

- `addSession(session)` — prepends a new session to the list
- `updateSession(id, updates)` — merges partial updates into an existing session

Most data fetching is handled by custom hooks in `src/hooks/` that call the API service layer directly and update local component state, using the Zustand store primarily for cross-component session synchronization.

### API Service Layer

The `src/services/api.ts` module creates a centralized Axios HTTP client configured with the `VITE_API_BASE_URL` base URL and a 60-second timeout. It exports three API namespaces:

- **`sessionsApi`** — `list()`, `create(patientRef?)`, `get(sessionId)`, `poll(sessionId)`
- **`captureApi`** — `uploadImage(sessionId, file)` sending `FormData` with `multipart/form-data`
- **`assessmentApi`** — `getBySession(sessionId)`, `getById(assessmentId)`

Each method returns a typed Promise that unwraps the Axios response, providing clean typed data to the consuming hooks.

## Backend Architecture

The backend follows a **layered architecture** with four distinct layers, each with a single responsibility:

### API Layer — `app/api/v1/endpoints/`

The top layer defines FastAPI router endpoints that handle HTTP concerns — request parsing, response serialization, and HTTP status codes. Each endpoint file registers an `APIRouter`:

- **`sessions.py`** — CRUD endpoints for session management. Converts internal `Session` objects to `SessionResponse` schemas with camelCase field names and computed `qrUrl`.
- **`capture.py`** — Single `POST /{session_id}` endpoint that validates the upload (file type, size, session status), stores the image, and spawns a background analysis task via `asyncio.create_task`.
- **`assessments.py`** — Read-only endpoints for retrieving assessments by ID or session ID. Also contains `store_assessment()` called internally by the capture background task.

### Service Layer — `app/services/`

The middle layer encapsulates business logic and external integrations, keeping the API layer thin:

- **`session_service.py`** — CRUD operations on `SessionDB` via SQLAlchemy: `create_session`, `get_session`, `list_sessions`, `update_session`. Handles session TTL calculation and status transitions.
- **`gemini_service.py`** — Wraps the Google Generative AI SDK. Sends wound image bytes to Gemini 2.5 Flash with a clinical analysis prompt and parses the structured JSON response.
- **`storage_service.py`** — Uploads image bytes to Supabase Storage under the path `wounds/{session_id}/{uuid}.{ext}` and returns the public URL.

### Model Layer — `app/models/`

Defines the data structures:

- **`db_models.py`** — SQLAlchemy ORM models (`SessionDB`, `AssessmentDB`) mapping to PostgreSQL tables. Uses `JSONB` for the assessment `result` column to store the full Gemini response as structured JSON.
- **`session.py`** — `SessionStatus` enum (`PENDING`, `IMAGE_RECEIVED`, `ANALYZING`, `COMPLETE`, `ERROR`) and a `Session` dataclass used as the internal domain object.

### Schema Layer — `app/schemas/`

Pydantic models for API request/response serialization and validation:

- **`session.py`** — `CreateSessionRequest` (optional `patientRef` field) and `SessionResponse` (full session with computed fields like `qrUrl`).
- **`assessment.py`** — `WoundAssessmentResponse` with nested `WoundDimensions` and `ExudateInfo` models. Defines 20+ typed fields covering the complete clinical assessment output.

## Database Schema

### sessions table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (UUID) | NOT NULL, Primary Key | Unique session identifier |
| `status` | Enum (SessionStatus) | NOT NULL | Current session state: `pending`, `image_received`, `analyzing`, `complete`, `error` |
| `patient_ref` | String | Nullable | Optional patient reference provided at session creation |
| `image_url` | String | Nullable | Supabase Storage public URL of the uploaded wound image |
| `assessment_id` | String | Nullable | Foreign reference to the assessment created after analysis |
| `error_message` | Text | Nullable | Error details if the session entered the `error` state |
| `created_at` | DateTime | NOT NULL | Timestamp when the session was created (defaults to UTC now) |
| `expires_at` | DateTime | Nullable | Timestamp when the session expires (created_at + SESSION_TTL_MINUTES) |

### assessments table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (UUID) | NOT NULL, Primary Key | Unique assessment identifier |
| `session_id` | String | NOT NULL | References the session that triggered this assessment |
| `image_url` | String | NOT NULL | Supabase Storage public URL of the analyzed wound image |
| `patient_ref` | String | Nullable | Patient reference copied from the parent session |
| `analyzed_at` | DateTime | NOT NULL | Timestamp when the Gemini analysis completed (defaults to UTC now) |
| `result` | JSONB | NOT NULL | Full structured assessment output from Gemini (wound type, dimensions, severity, recommendations, etc.) |

## Supabase Storage Structure

Wound images are stored in a Supabase Storage bucket named **`wound-images`** (configured via the `SUPABASE_WOUND_IMAGES_BUCKET` environment variable).

### Path Pattern

```
wound-images/
  wounds/
    {session_id}/
      {uuid}.{ext}
```

Each upload generates a unique filename using `uuid.uuid4().hex` combined with the original file extension (`.jpg`, `.jpeg`, `.png`, `.webp`, or `.heic`). Files are organized by session ID, so all images for a given session are grouped under the same directory.

### Public URL Access

After upload, the `storage_service` calls `get_public_url()` to obtain a publicly accessible URL for the image. This public URL is:

- Stored in the `image_url` column of both the `sessions` and `assessments` tables
- Used by the frontend to display the wound image on the `AssessmentResultPage`
- Embedded in the PDF export so the image appears in the downloaded clinical report
- Requires the bucket to have public access enabled in Supabase Storage settings

## Session State Machine

```
[PENDING]
    │
    │ POST /capture/:id — image uploaded to Supabase Storage
    ▼
[IMAGE_RECEIVED]
    │
    │ Background task triggered
    ▼
[ANALYZING]
    │
    ├── Gemini success ──► [COMPLETE] ──► Assessment saved to Postgres
    │
    └── Gemini failure ──► [ERROR] ──► error_message saved to session
```

- **PENDING** — Session created, awaiting image upload. The QR code is active and the frontend polls for status changes.
- **IMAGE_RECEIVED** — Image successfully uploaded to Supabase Storage. The `image_url` is set on the session. A background task is immediately spawned.
- **ANALYZING** — The background task is actively sending the image to Gemini 2.5 Flash and awaiting the response.
- **COMPLETE** — Gemini returned a successful analysis. The assessment is stored in the `assessments` table and the `assessment_id` is linked to the session.
- **ERROR** — Gemini analysis failed. The `error_message` field contains the failure details.

The frontend polls `GET /api/v1/sessions/:id/status` every few seconds. When the status transitions to `COMPLETE`, the frontend navigates to the assessment results page. When it transitions to `ERROR`, the frontend displays the error message.

## API Endpoints Reference

### Sessions

#### `POST /api/v1/sessions`

Create a new wound assessment session.

- **Request Body:**
  ```json
  {
    "patientRef": "string (optional)"
  }
  ```
- **Response:** `SessionResponse`
  ```json
  {
    "id": "uuid",
    "patientRef": "string | null",
    "createdAt": "ISO 8601 datetime",
    "expiresAt": "ISO 8601 datetime",
    "status": "pending",
    "qrUrl": "https://frontend-url/capture/{id}",
    "assessmentId": null
  }
  ```
- **Description:** Creates a new session with `PENDING` status and an expiration time based on `SESSION_TTL_MINUTES`. Returns the session with a computed `qrUrl` for mobile capture.

---

#### `GET /api/v1/sessions`

List all sessions ordered by creation date (newest first).

- **Request Body:** None
- **Response:** `SessionResponse[]`
- **Description:** Returns all sessions regardless of status, ordered by `created_at` descending.

---

#### `GET /api/v1/sessions/:id`

Get full session details by ID.

- **Request Body:** None
- **Response:** `SessionResponse`
- **Description:** Returns the session matching the given ID. Returns `404` if not found.

---

#### `GET /api/v1/sessions/:id/status`

Poll session status for real-time updates.

- **Request Body:** None
- **Response:** `SessionResponse`
- **Description:** Identical to `GET /sessions/:id` — exists as a semantic endpoint for frontend polling. Returns `404` if not found.

---

### Capture

#### `POST /api/v1/capture/:id`

Upload a wound image and trigger AI analysis.

- **Request Body:** `multipart/form-data` with a `file` field
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
  - Max size: 10 MB
- **Response:**
  ```json
  {
    "message": "Image received. Analysis in progress."
  }
  ```
- **Description:** Validates the session exists and is in `PENDING` status, validates the file type and size, uploads the image to Supabase Storage, updates the session status to `IMAGE_RECEIVED`, and spawns a background task that transitions through `ANALYZING` to `COMPLETE` (or `ERROR`). Returns immediately after upload — the AI analysis runs asynchronously.

---

### Assessments

#### `GET /api/v1/assessments/:id`

Get assessment by its own ID.

- **Request Body:** None
- **Response:** `WoundAssessmentResponse`
  ```json
  {
    "id": "uuid",
    "sessionId": "uuid",
    "imageUrl": "https://supabase-url/wound-images/...",
    "analyzedAt": "ISO 8601 datetime",
    "patientRef": "string | null",
    "woundType": "string",
    "probableCause": "string",
    "estimatedDimensions": {
      "lengthCm": "string",
      "widthCm": "string",
      "depthCm": "string",
      "note": "string"
    },
    "woundDepth": "string",
    "woundStage": "string | null",
    "woundBed": "string",
    "exudate": {
      "amount": "string",
      "type": "string"
    },
    "periwoundSkin": "string",
    "infectionSigns": ["string"],
    "diagnosis": "string",
    "differentialDiagnosis": ["string"],
    "severity": "string",
    "healingPhase": "string",
    "immediateActions": ["string"],
    "dressingSuggestions": ["string"],
    "referralRecommendations": ["string"],
    "followUpTimeline": "string",
    "additionalWorkup": ["string"],
    "redFlags": ["string"],
    "disclaimer": "string"
  }
  ```
- **Description:** Returns the full wound assessment by assessment ID. Returns `404` if not found.

---

#### `GET /api/v1/assessments/session/:id`

Get assessment by the session that created it.

- **Request Body:** None
- **Response:** `WoundAssessmentResponse` (same shape as above)
- **Description:** Returns the most recent assessment for the given session ID (ordered by `analyzed_at` descending). Returns `404` if no assessment exists for the session.
