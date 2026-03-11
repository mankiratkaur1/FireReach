# FireReach - Autonomous Outreach Engine (Production Edition)

An agentic outreach web application prototype that automatically captures buyer signals using live internet search engines, analyzes accounts via Gemini, and generates hyper-personalized outreach emails sent securely through Resend.

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- API Keys: `GEMINI_API_KEY`, `RESEND_API_KEY`
- Live Search Keys (at least one): `TAVILY_API_KEY` or `SERPAPI_KEY`

### 1. Setup the Backend
1. Enter the backend directory and set up the virtual environment.
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Copy the `.env.example` to `.env` and fill out the environment variables.
```bash
cp .env.example .env
```
*Note: Make sure to define `RESEND_FROM_EMAIL`. It defaults to `onboarding@resend.dev`.*

3. Start the FastAPI backend on port 8000:
```bash
uvicorn main:app --reload --port 8000
```
*Observe the console logs: the app will throw a `CRITICAL WARNING` if required keys are missing!*

### 2. Setup the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The shiny new SaaS UI will instantly display diagnostic badges indicating whether you've successfully connected Gemini, Resend, and Live Search logic.

Provide an ICP and Target Company and execute the live autonomous execution.
