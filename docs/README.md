# WoundCare AI

WoundCare AI is an AI-powered wound assessment platform designed for healthcare providers. It enables clinicians to create assessment sessions, capture wound images via QR code scanning on a mobile device or direct desktop upload, and receive instant, comprehensive clinical wound assessments powered by Google Gemini 2.5 Flash vision analysis. The platform generates structured reports covering 15+ clinical data points — including wound type, dimensions, tissue composition, infection indicators, and recommended interventions — that can be exported as clean clinical PDFs for patient records.

## Key Features

- **New Encounter Creation** with optional patient reference
- **QR Code Generation** for mobile capture
- **Dual Upload** — provider desktop upload or patient mobile capture
- **Real-time session status polling** with live timeline
- **AI-powered wound analysis** via Gemini 2.5 Flash
- **Comprehensive clinical assessment report** with 15+ data points
- **PDF export** with patient reference as filename
- **Session history** with stats dashboard

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite | Provider web application |
| UI Library | Radix UI Themes | Clinical grade component system |
| Backend | Python 3.11 + FastAPI | REST API server |
| AI Vision | Google Gemini 2.5 Flash | Wound image analysis |
| Database | Supabase Postgres (Session Pooler) | Sessions and assessments persistence |
| Storage | Supabase Storage | Wound image files |
| QR Code | qrcode.react | Session QR generation |

## Project Structure

```
wound-care-ai/
├── frontend/                                # React provider web application
│   ├── index.html                           # HTML entry point
│   ├── package.json                         # Dependencies and npm scripts
│   ├── tsconfig.json                        # TypeScript compiler configuration
│   ├── tsconfig.node.json                   # TypeScript config for build tooling
│   ├── vite.config.ts                       # Vite build configuration with React plugin and API proxy
│   ├── .env.example                         # Environment variables template
│   ├── dist/                                # Production build output
│   └── src/
│       ├── main.tsx                          # App entry point — Radix UI theme, router, and Zustand setup
│       ├── App.tsx                           # Root router component with page route definitions
│       ├── vite-env.d.ts                    # Vite client type declarations
│       ├── pages/
│       │   ├── DashboardPage.tsx            # Home dashboard with session list and create encounter UI
│       │   ├── SessionsPage.tsx             # Session history page listing past encounters
│       │   ├── SessionPage.tsx              # Individual session detail with real-time status polling
│       │   ├── MobileCapturePage.tsx        # Mobile-optimized image capture page (camera or file upload)
│       │   └── AssessmentResultPage.tsx     # Full assessment results display with PDF export
│       ├── components/
│       │   ├── common/
│       │   │   ├── AnalysisProgress.tsx     # Animated progress indicator during AI analysis
│       │   │   ├── EmptyState.tsx           # Empty state placeholder with illustration
│       │   │   ├── LoadingSpinner.tsx       # Reusable loading spinner
│       │   │   ├── PulsingCard.tsx          # Card with pulsing animation for pending states
│       │   │   ├── SeverityBadge.tsx        # Color-coded wound severity badge
│       │   │   └── StatusBadge.tsx          # Session status indicator badge
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx            # Main layout shell with sidebar and header
│       │   │   ├── MobileLayout.tsx         # Minimal layout for mobile capture pages
│       │   │   └── PageHeader.tsx           # Page header with title and action buttons
│       │   ├── qr/
│       │   │   └── QRCodeDisplay.tsx        # QR code generator and display component
│       │   └── wound/
│       │       ├── NewEncounterDialog.tsx   # Dialog for creating a new assessment session
│       │       ├── ProviderUpload.tsx       # Desktop drag-and-drop file upload component
│       │       └── SessionTimeline.tsx      # Timeline view of session events and assessments
│       ├── hooks/
│       │   ├── useCreateSession.ts          # Hook for creating new sessions via API
│       │   ├── useSessions.ts               # Hook for fetching all sessions
│       │   ├── useSession.ts                # Hook for fetching a single session with auto-polling
│       │   ├── useImageUpload.ts            # Hook for uploading wound images
│       │   ├── useAssessment.ts             # Hook for fetching assessment results
│       │   └── useMobileCapture.ts          # Hook for mobile camera capture workflow
│       ├── services/
│       │   ├── api.ts                       # Axios HTTP client with API endpoint definitions
│       │   └── supabase.ts                  # Supabase client initialization
│       ├── store/
│       │   └── sessionStore.ts              # Zustand store for session state management
│       ├── types/
│       │   └── index.ts                     # TypeScript interfaces for Session and WoundAssessment
│       ├── utils/
│       │   └── formatDate.ts                # Date formatting utility functions
│       └── styles/
│           ├── globals.css                  # Global application styles
│           └── print.css                    # Print-specific styles for PDF export
│
├── backend/                                 # Python FastAPI REST API server
│   ├── run.py                               # Entry point — starts uvicorn server
│   ├── run_backend.sh                       # Bash script for venv setup and server startup
│   ├── requirements.txt                     # Python package dependencies
│   ├── .env.example                         # Environment variables template
│   ├── .gitignore                           # Git ignore rules
│   ├── tests/                               # Test suite directory
│   └── app/
│       ├── __init__.py                      # Package marker
│       ├── main.py                          # FastAPI app init, CORS, startup validation, router inclusion
│       ├── core/
│       │   ├── __init__.py                  # Package marker
│       │   ├── config.py                    # Pydantic settings loaded from environment variables
│       │   ├── database.py                  # SQLAlchemy engine and session factory
│       │   └── supabase_client.py           # Supabase client initialization
│       ├── api/
│       │   ├── __init__.py                  # Package marker
│       │   └── v1/
│       │       ├── __init__.py              # V1 router combining all endpoint routers
│       │       └── endpoints/
│       │           ├── __init__.py          # Package marker
│       │           ├── sessions.py          # POST/GET session endpoints and status polling
│       │           ├── capture.py           # POST image upload with async AI analysis trigger
│       │           └── assessments.py       # GET assessment by ID or by session
│       ├── models/
│       │   ├── __init__.py                  # Package marker
│       │   ├── db_models.py                 # SQLAlchemy ORM models (SessionDB, AssessmentDB)
│       │   └── session.py                   # Session status enum and session model
│       ├── schemas/
│       │   ├── __init__.py                  # Package marker
│       │   ├── session.py                   # CreateSessionRequest and SessionResponse schemas
│       │   └── assessment.py                # AssessmentResponse Pydantic schema
│       ├── services/
│       │   ├── __init__.py                  # Package marker
│       │   ├── session_service.py           # Session CRUD operations on database
│       │   ├── gemini_service.py            # Google Gemini Vision API integration
│       │   └── storage_service.py           # Supabase Storage file upload service
│       └── utils/
│           └── __init__.py                  # Package marker
│
└── docs/
    └── README.md                            # This file — project documentation
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A Supabase project (with Storage bucket created)
- A Google Gemini API key

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env

# Start the development server (runs on http://localhost:5173)
npm run dev
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Copy the environment template and fill in your values
cp .env.example .env

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the API server (runs on http://localhost:8000)
python run.py
```

Alternatively, use the provided setup script which handles venv creation, dependency installation, and server startup in one step:

```bash
cd backend
bash run_backend.sh
```

### Verify Setup

- Frontend: Open http://localhost:5173 in your browser
- Backend health check: `curl http://localhost:8000/health`
- API docs (Swagger): http://localhost:8000/docs

## Environment Variables

### Frontend

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | Backend API server base URL | `http://localhost:8000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Backend

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `GOOGLE_API_KEY` | Google Gemini API key for wound image analysis | `AIzaSy...` |
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_WOUND_IMAGES_BUCKET` | Supabase Storage bucket name for wound images | `wound-images` |
| `DATABASE_URL` | PostgreSQL connection string (Supabase Session Pooler) | `postgresql://postgres.ref:pass@aws-0-region.pooler.supabase.com:5432/postgres` |
| `FRONTEND_URL` | Frontend URL used for CORS and QR code generation | `http://localhost:5173` |
| `APP_ENV` | Application environment mode | `development` |
| `APP_PORT` | Server listening port | `8000` |
| `SESSION_TTL_MINUTES` | Session time-to-live before expiration | `30` |
