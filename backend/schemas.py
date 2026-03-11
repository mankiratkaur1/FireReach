from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Common Enums/Types
SignalType = Literal["funding_round", "leadership_change", "hiring_trend", "social_mention", "tech_stack_change", "keyword_intent", "growth", "other"]
ConfidenceLevel = Literal["high", "medium", "low"]
DeliveryStatus = Literal["sent", "failed", "skipped"]

# Target Input
class AgentTargetInput(BaseModel):
    icp: str = Field(..., description="Ideal Customer Profile")
    company: str = Field(..., description="Target Company Name")
    recipient_email: str = Field(..., description="Recipient Email Address")

# Signals (Tool 1)
class Signal(BaseModel):
    type: SignalType
    summary: str
    value: str
    date: str
    source_url: str = Field(..., description="Specific URL of the evidence")
    source_name: str = Field(..., description="Name of the publisher/site")
    confidence: ConfidenceLevel

class HarvesterResponse(BaseModel):
    company: str
    signals: List[Signal]

# Research / Account Brief (Tool 2)
class AnalystInput(BaseModel):
    icp: str
    company: str
    signals: List[Signal]

class AnalystResponse(BaseModel):
    account_brief: str = Field(..., description="2 paragraph grounded analysis string")

# Outreach / Sender (Tool 3)
class SenderInput(BaseModel):
    recipient_email: str
    company: str
    icp: str
    signals: List[Signal]
    account_brief: str

class SenderResponse(BaseModel):
    subject: str
    body: str
    delivery_status: DeliveryStatus
    provider_response: str = Field(..., description="Failure reason or success status")
    timestamp: str

# Final Orchestration Response
class OrchestrationResponse(BaseModel):
    status: Literal["success", "failure"]
    message: str
    harvested_signals: Optional[HarvesterResponse] = None
    account_brief: Optional[str] = None
    outreach_result: Optional[SenderResponse] = None
    timeline: List[str] = []

# Diagnostics Response
class DiagnosticsResponse(BaseModel):
    gemini_connected: bool
    resend_connected: bool
    live_search_configured: bool
    resend_from_email: Optional[str]
