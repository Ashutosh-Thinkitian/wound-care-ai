# WoundCare AI

AI-powered wound assessment application using Google Gemini Vision API.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + **Radix UI Themes**
- **Backend**: Python 3.12 + FastAPI
- **AI**: Google Gemini 2.5 Flash (Vision)
- **Storage**: Supabase Storage (wound images) + in-memory sessions
- **QR**: Dynamic session QR codes for mobile capture

## Project Structure
```
wound-care-ai/
├── frontend/          # React + Vite + TypeScript + Radix UI
└── backend/           # Python FastAPI + Supabase Storage
```

## Environment Setup

> **Important:** Never commit `.env` files — they are gitignored. Only `.env.example` files with placeholder values should be in the repo.

### Backend
```bash
cd backend
cp .env.example .env
```
Fill in your real values in `backend/.env`:
- **GOOGLE_API_KEY** — get from https://aistudio.google.com/apikey
- **SUPABASE_URL** — from your Supabase project dashboard under Settings > API
- **SUPABASE_SERVICE_ROLE_KEY** — from Supabase dashboard under Settings > API (use the `service_role` key, not the `anon` key)
- **FRONTEND_URL** — your frontend URL (default `http://localhost:5173`, or your ngrok URL for mobile testing)

### Frontend
```bash
cd frontend
cp .env.example .env.local
```
Fill in your real values in `frontend/.env.local`:
- **VITE_API_BASE_URL** — your backend URL (default `http://localhost:8000`)
- **VITE_SUPABASE_URL** — same as backend SUPABASE_URL
- **VITE_SUPABASE_ANON_KEY** — from Supabase dashboard under Settings > API (use the `anon` public key)

## Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Go to Storage > Create bucket: `wound-images` (set to public for direct image URLs)
3. Copy your project URL and keys into `.env` files as described above

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Image Flow
1. Mobile browser captures/uploads wound photo
2. Backend reads bytes > uploads to **Supabase Storage** > gets public URL
3. Same bytes sent to **Gemini Vision** for analysis (no disk writes)
4. Public URL stored in assessment result (frontend displays image from Supabase CDN)
