# Simple Deployment Guide - Render

## Backend Deployment (Web Service)

1. Go to https://dashboard.render.com → **New +** → **Web Service**
2. Connect your GitHub repo: `kish-17/Database-Project`
3. Fill in:
   - **Name**: `database-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `DB_URL` = your Supabase database URL
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Create Web Service**
6. **Copy your backend URL** (e.g., `https://database-backend.onrender.com`)

## Frontend Deployment (Static Site)

1. Go to Render Dashboard → **New +** → **Static Site**
2. Connect your GitHub repo: `kish-17/Database-Project`
3. Fill in:
   - **Name**: `database-frontend`
   - **Root Directory**: `frontend` (this tells Render to run commands from the frontend folder)
   - **Build Command**: `npm install && npm run build` (just the command, no directory prefix, no $ prompt)
   - **Publish Directory**: `dist` (just the folder name, this is where Vite builds your app)
4. Add Environment Variable:
   - `VITE_API_URL` = your backend URL from step 6 above (e.g., `https://database-backend.onrender.com`)
5. Click **Create Static Site**
6. **Copy your frontend URL**

**Important:** 
- Build Command should be ONLY: `npm install && npm run build` (no `database-frontend/` or `$` prompt)
- Publish Directory should be ONLY: `dist` (not `database-frontend/` or `e.g. build`)

## Update Backend CORS

1. Go to your backend service → **Environment** tab
2. Add environment variable:
   - `FRONTEND_URL` = your frontend URL from step 6 above
3. Update `backend/main.py` CORS to include your frontend URL
4. Commit and push changes

## Done! 🎉

Your app is live at your frontend URL!

