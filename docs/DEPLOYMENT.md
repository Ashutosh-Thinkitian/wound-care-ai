# Deployment Guide

## Status
Backend deploys to Render. Frontend deploys to Vercel. Database and Storage on Supabase.

## Deployment Targets

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Static React build via Vite |
| Backend | Render | Python FastAPI with uvicorn |
| Database | Supabase Postgres | Cloud-hosted |
| Storage | Supabase Storage | Cloud-hosted |

## CI/CD Workflows

All workflows are in `.github/workflows/` and trigger on the `master` branch.

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| CI Checks | `ci.yml` | Push or PR to `master` | Python syntax check + frontend type-check & build |
| Deploy Backend | `deploy-backend.yml` | Push to `master` (backend/** changed) | Syntax verify, then trigger Render deploy hook |
| Deploy Frontend | `deploy-frontend.yml` | Push to `master` (frontend/** changed) | Type-check, build, deploy to Vercel |

### Deployment Flow

```
Push to master
    │
    ├── CI Checks run (backend + frontend)
    │
    ├── backend/** changed? → Render deploy triggered via deploy hook
    │
    └── frontend/** changed? → Build + deploy to Vercel
```

## GitHub Secrets Required

Go to repo Settings → Secrets and variables → Actions → New repository secret.

### Render (1 secret)

| Secret | Where to get it |
|--------|----------------|
| `RENDER_DEPLOY_HOOK` | Render dashboard → Service → Settings → Deploy Hook → Copy URL |

### Vercel (3 secrets)

| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel dashboard → Settings, or `.vercel/project.json` after linking |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after linking project |

### Frontend Env (3 secrets)

| Secret | Value |
|--------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

## Environment Variables for Production

### Frontend — set in Vercel dashboard

```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Backend — set in Render dashboard

```
GOOGLE_API_KEY=your-production-google-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
SUPABASE_WOUND_IMAGES_BUCKET=wound-images
DATABASE_URL=your-production-session-pooler-url
FRONTEND_URL=https://your-app.vercel.app
APP_ENV=production
```

Note: Render sets the `PORT` variable automatically — do not set `APP_PORT` manually.

## Pre-Deployment Checklist

- [ ] `FRONTEND_URL` set to production Vercel domain in Render env vars
- [ ] `VITE_API_BASE_URL` set to production Render URL in Vercel env vars
- [ ] All API keys rotated for production — do not reuse development keys
- [ ] Supabase RLS policies reviewed and configured
- [ ] `GOOGLE_API_KEY` production quota verified
- [ ] Health check endpoint verified at `GET /health`
- [ ] Database tables verified in production Supabase project
- [ ] Supabase Storage bucket `wound-images` set to correct access policy
- [ ] All 7 GitHub Actions secrets added (see above)

## Important Notes

- Never commit `.env` files to version control — they contain secrets and are in `.gitignore`.
- Use platform dashboards (Vercel, Render) to configure all secrets for production.
- Rotate all API keys between development and production.
- The backend includes a keep-alive ping (every 14 minutes) to prevent Render free tier from sleeping.
