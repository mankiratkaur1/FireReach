from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

from schemas import (
    AgentTargetInput,
    OrchestrationResponse,
    AnalystInput,
    AnalystResponse,
    SenderInput,
    SenderResponse,
    HarvesterResponse,
    DiagnosticsResponse
)
from tools.harvester import run_signal_harvester
from tools.analyst import run_research_analyst
from tools.sender import run_outreach_sender
from agent import execute_firereach_agent

app = FastAPI(
    title="FireReach - Autonomous Outreach Engine",
    description="Agentic outreach API capturing deterministic signals and crafting highly personalized emails.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_check():
    """Validate required environment variables on startup."""
    missing = []
    if not os.getenv("GROQ_API_KEY"): missing.append("GROQ_API_KEY")
    if not os.getenv("RESEND_API_KEY"): missing.append("RESEND_API_KEY")
    if not os.getenv("RESEND_FROM_EMAIL"): missing.append("RESEND_FROM_EMAIL")
    if not os.getenv("SERPAPI_KEY") and not os.getenv("TAVILY_API_KEY"): 
        print("WARNING: Neither SERPAPI_KEY nor TAVILY_API_KEY is set. Signal harvesting will fail.")
    
    if missing:
        print(f"CRITICAL WARNING: Missing required environment variables: {', '.join(missing)}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "FireReach API is running"}

@app.get("/api/diagnostics", response_model=DiagnosticsResponse)
def get_diagnostics():
    """Return backend configuration state for the UI."""
    return DiagnosticsResponse(
        gemini_connected=bool(os.getenv("GROQ_API_KEY")),
        resend_connected=bool(os.getenv("RESEND_API_KEY")),
        live_search_configured=bool(os.getenv("SERPAPI_KEY") or os.getenv("TAVILY_API_KEY")),
        resend_from_email=os.getenv("RESEND_FROM_EMAIL")
    )

@app.post("/run-agent", response_model=OrchestrationResponse)
def run_agent_workflow(input_data: AgentTargetInput):
    """Run the entire agent sequence sequentially."""
    try:
        response = execute_firereach_agent(input_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/signal-harvester", response_model=HarvesterResponse)
def trigger_harvester(company: str):
    """Manual trigger for Tool 1"""
    return run_signal_harvester(company)

@app.post("/tools/research-analyst", response_model=AnalystResponse)
def trigger_analyst(input_data: AnalystInput):
    """Manual trigger for Tool 2"""
    return run_research_analyst(input_data)

@app.post("/tools/outreach-sender", response_model=SenderResponse)
def trigger_sender(input_data: SenderInput):
    """Manual trigger for Tool 3"""
    return run_outreach_sender(input_data)
