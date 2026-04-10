from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
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
    DiagnosticsResponse,
    Contact
)
from tools.harvester import run_signal_harvester
from tools.analyst import run_research_analyst
from tools.sender import run_outreach_sender
from tools.contact_finder import run_contact_discovery
from agent import execute_firereach_agent

app = FastAPI(
    title="FireReach - Autonomous Outreach Engine",
    description="Agentic outreach API capturing deterministic signals and crafting highly personalized emails.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_check():
    missing = []
    if not os.getenv("GROQ_API_KEY"): missing.append("GROQ_API_KEY")
    if not os.getenv("SMTP_USERNAME"): print("WARNING: SMTP_USERNAME is not set. Email dispatch will fail.")
    if not os.getenv("SERPAPI_KEY") and not os.getenv("TAVILY_API_KEY"):
        print("WARNING: Neither SERPAPI_KEY nor TAVILY_API_KEY is set.")
    if missing:
        print(f"CRITICAL WARNING: Missing env vars: {', '.join(missing)}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "FireReach API is running"}

@app.get("/api/diagnostics", response_model=DiagnosticsResponse)
def get_diagnostics():
    return DiagnosticsResponse(
        gemini_connected=bool(os.getenv("GROQ_API_KEY")),
        smtp_configured=bool(os.getenv("SMTP_USERNAME")),
        live_search_configured=bool(os.getenv("SERPAPI_KEY") or os.getenv("TAVILY_API_KEY")),
        smtp_username=os.getenv("SMTP_USERNAME")
    )

# ── Contact Discovery (Step 1 only) ──
class DiscoverReq(BaseModel):
    company: str
    icp: str = ""

class DiscoverRes(BaseModel):
    company: str
    contacts: list

@app.post("/discover-contacts", response_model=DiscoverRes)
def discover_contacts(req: DiscoverReq):
    """Returns 2-3 decision-maker contacts for a company without running the full pipeline."""
    try:
        contacts = run_contact_discovery(req.company, req.icp)
        return {"company": req.company, "contacts": [c.model_dump() for c in contacts]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Full Pipeline ──
@app.post("/run-agent", response_model=OrchestrationResponse)
def run_agent_workflow(input_data: AgentTargetInput):
    """Run the full 5-step pipeline. Accepts optional pre-selected contacts to skip discovery."""
    try:
        response = execute_firereach_agent(input_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Individual Tool Endpoints ──
@app.post("/tools/signal-harvester", response_model=HarvesterResponse)
def trigger_harvester(company: str):
    return run_signal_harvester(company)

@app.post("/tools/research-analyst", response_model=AnalystResponse)
def trigger_analyst(input_data: AnalystInput):
    return run_research_analyst(input_data)

@app.post("/tools/outreach-sender", response_model=SenderResponse)
def trigger_sender(input_data: SenderInput):
    return run_outreach_sender(input_data)
