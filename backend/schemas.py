from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Common Enums/Types
SignalType = Literal["funding_round", "leadership_change", "hiring_trend", "social_mention", "tech_stack_change", "keyword_intent", "growth", "other"]
ConfidenceLevel = Literal["high", "medium", "low"]
DeliveryStatus = Literal["sent", "failed", "skipped"]

# Attachment
class Attachment(BaseModel):
    filename: str = Field(..., description="Name of the file (e.g. pitch.pdf)")
    mime_type: str = Field(..., description="MIME type (e.g. application/pdf)")
    data_base64: str = Field(..., description="Base64 encoded file content")

# Target Input
class AgentTargetInput(BaseModel):
    icp: str = Field(..., description="Ideal Customer Profile")
    company: str = Field(..., description="Target Company Name")
    contacts: Optional[List['Contact']] = Field(default=None, description="Pre-selected contacts")
    attachments: Optional[List[Attachment]] = Field(default=None, description="Global attachments to apply to all sent emails")
    sender_name: str = Field(default="", description="The user's full name")
    sender_company: str = Field(default="", description="The user's company name")
    sender_designation: str = Field(default="", description="The user's role designation")

# Contact (Step 1)
class Contact(BaseModel):
    name: str = Field(..., description="Full name of the contact")
    role: str = Field(..., description="Job title, e.g., CTO, VP Engineering")
    email: str = Field(..., description="Email address")
    linkedin: Optional[str] = Field(None, description="LinkedIn URL")
    is_icp_match: bool = Field(default=True, description="Whether this role aligns with the target ICP")

# Signals (Step 2)
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

# Research / Account Brief (Step 3)
class AnalystInput(BaseModel):
    icp: str
    company: str
    contact: Contact
    signals: List[Signal]

class AnalystResponse(BaseModel):
    account_brief: str = Field(..., description="2 paragraph grounded analysis string")

# Outreach / Sender (Step 4 & 5)
class SenderInput(BaseModel):
    contact: Contact
    company: str
    icp: str
    signals: List[Signal]
    account_brief: str
    attachments: Optional[List[Attachment]] = None
    sender_name: str = ""
    sender_company: str = ""
    sender_designation: str = ""

class SenderResponse(BaseModel):
    subject: str
    body: str
    delivery_status: DeliveryStatus
    provider_response: str = Field(..., description="Failure reason or success status")
    timestamp: str

class OutreachLogEntry(BaseModel):
    contact_name: str
    role: str
    email: str
    status: DeliveryStatus
    subject: str
    key_signal: str
    body: str

# Final Orchestration Response
class OrchestrationResponse(BaseModel):
    status: Literal["success", "failure"]
    message: str
    harvested_signals: Optional[HarvesterResponse] = None
    contacts_targeted: List[Contact] = []
    outreach_logs: List[OutreachLogEntry] = []
    timeline: List[str] = []

# Diagnostics Response
class DiagnosticsResponse(BaseModel):
    gemini_connected: bool
    live_search_configured: bool
    smtp_configured: bool
    smtp_username: Optional[str]
