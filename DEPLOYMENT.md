# Deployment Guide - Render Platform

This guide will walk you through deploying your Community Social Media Platform on Render with Supabase as the database.

## Prerequisites

- GitHub account
- Render account (free tier available at https://render.com)
- Supabase account (free tier available at https://supabase.com)

## Step 1: Prepare Your Database (Supabase)

### 1.1 Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `community-db` (or your choice)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait for project to finish setting up (~2 minutes)

### 1.2 Get Database Credentials

1. In your Supabase project, go to **Settings** (gear icon)
2. Click **"Database"** in the left sidebar
3. Scroll to **"Connection string"** section
4. Copy the **"URI"** connection string (select "Session pooler" mode for better performance)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this connection string - you'll need it as `DB_URL`

**Example:**
```
postgresql://postgres.abcdefghijk:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 1.3 Get Supabase Auth Keys

1. In Supabase, go to **Settings** → **API**
2. Find **"Project URL"** - save this as `SUPABASE_URL`
3. Find **"anon public"** key - save this as `SUPABASE_ANON_KEY`

**Example:**
```
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.4 Run Database Migrations

You need to create the database tables. You can do this in two ways:

**Option A: Using Supabase SQL Editor**
1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy and paste this SQL:

```sql
-- Users table (already exists from Supabase Auth)
-- We only add custom columns
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    community_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
    membership_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    chat_id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chat_rooms(chat_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community ON memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
```

4. Click **"Run"** to execute

**Option B: Using Python Script**
1. Install `psycopg2`: `pip install psycopg2-binary`
2. Run your backend locally with migrations enabled

## Step 2: Push Code to GitHub

1. Create a new GitHub repository
2. Push your code:

```bash
cd "/Users/kishan/Database Project"
git init
git add .
git commit -m "Initial commit - Community platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `community-backend` (or your choice)
- **Region**: Choose same as your Supabase region
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **"Free"** (or upgrade if needed)

### 3.2 Add Environment Variables

Scroll to **"Environment Variables"** section and add:

| Key | Value |
|-----|-------|
| `DB_URL` | Your Supabase connection string from Step 1.2 |
| `SUPABASE_URL` | Your Supabase project URL from Step 1.3 |
| `SUPABASE_ANON_KEY` | Your Supabase anon key from Step 1.3 |

**Example:**
```
DB_URL=postgresql://postgres.abcdefghijk:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Create requirements.txt

Make sure your `backend/requirements.txt` includes:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
supabase==2.3.0
```

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Once deployed, you'll get a URL like: `https://community-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for the frontend

### 3.5 Verify Backend

Test your backend by visiting:
```
https://YOUR-BACKEND-URL.onrender.com/docs
```
You should see the FastAPI Swagger documentation.

## Step 4: Deploy Frontend on Render

### 4.1 Update API URL

1. Edit `frontend/src/api/axios.js`
2. Update the API_URL:

```javascript
const API_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

3. Commit and push:
```bash
git add .
git commit -m "Update API URL for production"
git push
```

### 4.2 Create Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:

**Basic Settings:**
- **Name**: `community-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 4.3 Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for deployment (~2-3 minutes)
3. You'll get a URL like: `https://community-frontend.onrender.com`

### 4.4 Update CORS in Backend

1. Go to your backend service on Render
2. Go to **"Environment"** tab
3. Add/update environment variable:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | Your frontend URL from Step 4.3 |

4. Update `backend/main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.environ.get("FRONTEND_URL", "")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

5. Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

## Step 5: Configure Supabase Auth URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your frontend URL to:
   - **Site URL**: `https://your-frontend-url.onrender.com`
   - **Redirect URLs**: Add `https://your-frontend-url.onrender.com/*`

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Try to sign up a new account
3. Create a community
4. Create a post
5. Test all features

## Troubleshooting

### Backend Issues

**Problem: Service won't start**
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure `requirements.txt` has all dependencies

**Problem: Database connection failed**
- Verify `DB_URL` is correct
- Check Supabase database is running
- Try using "Session pooler" connection string instead of "Direct connection"

**Problem: Authentication not working**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase Auth is enabled

### Frontend Issues

**Problem: API calls failing**
- Check API_URL in `axios.js` matches your backend URL
- Verify CORS settings in backend include your frontend URL
- Check browser console for errors

**Problem: Login not working**
- Verify Supabase Auth redirect URLs include your frontend URL
- Check browser console for auth errors

### Database Issues

**Problem: Tables not found**
- Run SQL migrations from Step 1.4
- Check Supabase SQL Editor for errors

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down will be slow (~30 seconds)
- 750 hours/month of runtime (enough for 1 service)

**Supabase Free Tier:**
- 500 MB database storage
- Up to 50,000 monthly active users
- 2 GB bandwidth

### Keeping Services Alive

To prevent your backend from spinning down, you can:
1. Use a service like UptimeRobot to ping your backend every 10 minutes
2. Upgrade to Render's paid tier ($7/month)

## Your Deployment Checklist

- [ ] Created Supabase project
- [ ] Saved database connection string (DB_URL)
- [ ] Saved Supabase URL and anon key
- [ ] Ran database migrations
- [ ] Pushed code to GitHub
- [ ] Deployed backend on Render
- [ ] Added backend environment variables
- [ ] Verified backend at /docs endpoint
- [ ] Updated frontend API URL
- [ ] Deployed frontend on Render
- [ ] Updated backend CORS settings
- [ ] Configured Supabase Auth URLs
- [ ] Tested signup/login
- [ ] Tested all features

## Support

If you encounter issues:
1. Check Render logs (Dashboard → Your Service → Logs)
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Check Supabase database logs

## Credentials Summary

**Save these securely:**

```
Supabase Project URL: https://YOUR_PROJECT.supabase.co
Supabase Anon Key: eyJhbGci...
Database URL: postgresql://postgres.YOUR_PROJECT:PASSWORD@...
Backend URL: https://YOUR-BACKEND.onrender.com
Frontend URL: https://YOUR-FRONTEND.onrender.com
```

---

**Congratulations! Your Community Platform is now live! 🚀**

