# WoundCare AI

AI-powered wound assessment application using Claude Vision API.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + **Radix UI Themes**
- **Backend**: Python 3.11 + FastAPI
- **AI**: Anthropic Claude (claude-opus-4-5) Vision
- **Storage**: Supabase Storage (wound images) + in-memory sessions
- **QR**: Dynamic session QR codes for mobile capture

## Project Structure
```
wound-care-ai/
├── frontend/          # React + Vite + TypeScript + Radix UI
└── backend/           # Python FastAPI + Supabase Storage
```

## Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Go to Storage → Create bucket: `wound-images` (set to public for direct image URLs)
3. Copy your project URL and keys into `.env` files

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local    # fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY + VITE_API_BASE_URL
npm run dev
```

## Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in all keys
python run.py
```

## Image Flow
1. Mobile browser captures/uploads wound photo
2. Backend reads bytes → uploads to **Supabase Storage** → gets public URL
3. Same bytes sent to **Claude Vision** for analysis (no disk writes)
4. Public URL stored in assessment result (frontend displays image from Supabase CDN)
