# FireReach Deployment Guide

## Backend Deployment on Render

### Step 1: Prepare the Backend
1. Ensure all dependencies are in `backend/requirements.txt`
2. Make sure your `.env` file is in `.gitignore` (already done)

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign in with GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in deployment details:
   - **Name**: `firereach-backend`
   - **Environment**: Python
   - **Region**: Oregon (or your preference)
   - **Branch**: main
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (to start)

### Step 3: Add Environment Variables on Render
In the Render dashboard, go to your service → Environment:
- `GROQ_API_KEY`: Your Groq API key
- `SMTP_USERNAME`: Your email for sending
- `SMTP_PASSWORD`: Your email password
- `SERPAPI_KEY`: (optional) SerpAPI key for web search
- `TAVILY_API_KEY`: (optional) Tavily API key for web search
- `GOOGLE_API_KEY`: (optional) Google Genai API key
- Any other required API keys

### Step 4: Deploy
- Click "Create Web Service"
- Render will automatically build and deploy
- You'll get a URL like: `https://firereach-backend.onrender.com`

**Note**: The backend will go to sleep after 15 minutes of inactivity on the free plan. Upgrade to Paid for 24/7 uptime.

---

## Frontend Deployment on Vercel

### Step 1: Prepare the Frontend
1. Update your API endpoint in the frontend code to point to your Render backend
   - Find where you make API calls and replace with: `https://firereach-backend.onrender.com`

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click "Add New..." → "Project"
4. Import your `FireReach` repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (set this!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables on Vercel
In the Vercel dashboard, go to Settings → Environment Variables:
- `VITE_API_URL`: `https://firereach-backend.onrender.com` (or your backend URL)

### Step 4: Deploy
- Click "Deploy"
- Vercel will build and deploy your frontend
- You'll get a URL like: `https://firereach.vercel.app`

---

## Update Frontend to Use Environment Variable

In your frontend code (e.g., `App.jsx` or API utility file), update API calls:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Use API_URL for all backend calls
fetch(`${API_URL}/endpoint`, { ... })
```

---

## CORS Configuration
Your backend already has CORS enabled for all origins (`allow_origins=["*"]`). This is fine for development but consider restricting it in production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://firereach.vercel.app"],  # Your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Quick Checklist
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set on both platforms
- [ ] Frontend points to correct backend URL
- [ ] Test API calls from frontend to backend
- [ ] Check browser console for CORS or network errors

---

## Useful Commands

### Local Testing Before Deploy
```bash
# Backend (from project root)
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend (from project root)
cd frontend
npm install
npm run dev
```

### View Logs
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → Select deployment → Logs
