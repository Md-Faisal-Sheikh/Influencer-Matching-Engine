# InfluenceIQ - Influencer Matching Engine

MarTech project for matching Bangladeshi brands with creators using deterministic scoring, optional free live YouTube data, optional Supabase storage, and graph-based trust scoring.

## What Is Included

- React + Vite + Tailwind frontend
- Express API backend
- 100-point influencer matching algorithm
- Local campaign strategy generator with no paid AI dependency
- Optional YouTube Data API v3 sync for public YouTube channel stats
- Optional Supabase free-tier database
- Pure JavaScript PageRank trust graph
- Bangla/English UI toggle
- Single-service deployment setup for Render free web services

## Free API Policy

This project is designed to run without paid APIs.

- YouTube Data API v3: optional live social stats for YouTube creators. `channels.list` costs 1 quota unit per request and Google provides a default daily quota.
- Supabase: optional free-tier hosted database. If credentials are not provided, the app uses `backend/localDb.json`.
- Instagram/TikTok: no live arbitrary-public-profile sync is called because their official APIs require app review, business permissions, or approved research access. The app uses an honest local fallback for those platforms.
- AI analysis: generated locally from scoring data. No Anthropic/OpenAI key is required.

## Local Development

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Full-Stack Production Build

From the repo root:

```bash
npm run setup
npm run build
npm start
```

The backend serves the built React app from `frontend/dist`, so the deployed app can run as one Node web service.

## Free Render Deployment

1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Use the included `render.yaml`, or set:
   - Build command: `npm run setup && npm run build`
   - Start command: `npm start`
   - Health check path: `/api/health`
4. Add optional environment variables:
   - `YOUTUBE_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CORS_ORIGIN` only if the frontend is hosted separately

## Supabase Setup

If you want hosted persistence, create a free Supabase project and run:

```sql
-- backend/supabase-schema.sql
```

Then add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the backend environment. If omitted, the app runs with the local JSON database.

## API Routes

- `GET /api/health`
- `GET /api/influencers`
- `GET /api/influencers/:id`
- `POST /api/influencers/:id/sync`
- `POST /api/match`
- `GET /api/brands`
- `POST /api/brands`
- `GET /api/trust-graph`

## Notes For Reviewers

The app avoids fake paid dependencies: matching, graph trust, and campaign recommendations work offline. Live API scoring is available through YouTube's free quota, while Instagram/TikTok are intentionally treated as local fallback channels unless official access is granted.
