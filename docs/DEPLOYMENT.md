# Deployment Guide

## Status

This application is currently running in local development mode. This document will be updated with full deployment instructions.

## Planned Deployment Targets

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Static React build via Vite |
| Backend | Railway or Render | Python FastAPI with uvicorn |
| Database | Supabase Postgres | Already cloud-hosted |
| Storage | Supabase Storage | Already cloud-hosted |

## Pre-Deployment Checklist

- [ ] `FRONTEND_URL` updated to production domain in backend environment
- [ ] CORS origins updated for production domain in `app/main.py`
- [ ] `VITE_API_BASE_URL` updated to production backend URL in frontend environment
- [ ] All API keys rotated for production — do not reuse development keys
- [ ] Supabase RLS policies reviewed and configured
- [ ] `GOOGLE_API_KEY` production quota verified
- [ ] Error monitoring configured such as Sentry
- [ ] Health check endpoint verified at `GET /health`
- [ ] Database tables verified in production Supabase project
- [ ] Supabase Storage bucket `wound-images` set to correct access policy

## Environment Variables for Production

### Frontend — set in Vercel dashboard

```
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Backend — set in Railway or Render dashboard

```
GOOGLE_API_KEY=your-production-google-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
SUPABASE_WOUND_IMAGES_BUCKET=wound-images
DATABASE_URL=your-production-session-pooler-url
FRONTEND_URL=https://your-app.vercel.app
APP_ENV=production
APP_PORT=8000
```

## Important Notes

- Never commit `.env` files to version control — they contain secrets and are already included in `.gitignore`.
- Use platform environment variable dashboards (Vercel, Railway, Render) to configure all secrets for production deployments rather than files on disk.
- Rotate all API keys and service role keys between development and production — never reuse development credentials in a production environment.
