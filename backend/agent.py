import os
from dotenv import load_dotenv
from typing import List

from schemas import AgentTargetInput, OrchestrationResponse, AnalystInput, SenderInput
from tools.harvester import run_signal_harvester
from tools.analyst import run_research_analyst
from tools.sender import run_outreach_sender

load_dotenv()

def execute_firereach_agent(input_data: AgentTargetInput) -> OrchestrationResponse:
    timeline: List[str] = []
    
    # 1. HARVESTER
    timeline.append(f"Started execution for target: {input_data.company}")
    timeline.append("Tool 1 [Signal Harvester]: Fetching deterministic buyer signals via live APIs...")
    
    try:
        harvester_res = run_signal_harvester(input_data.company)
    except Exception as e:
        return OrchestrationResponse(
            status="failure",
            message=f"Signal Harvester failed: {str(e)}",
            timeline=timeline
        )
    
    if not harvester_res.signals:
        timeline.append("Tool 1 [Signal Harvester]: No strong signals found on public web.")
        timeline.append("Safeguard Triggered: Halting intent to reach out to prevent low-quality outreach.")
        return OrchestrationResponse(
            status="failure",
            message="No strong signals found. Aborting sequence.",
            harvested_signals=harvester_res,
            timeline=timeline
        )
    
    timeline.append(f"Tool 1 [Signal Harvester]: Successfully captured {len(harvester_res.signals)} live signal(s).")
    
    # 2. ANALYST
    timeline.append("Tool 2 [Research Analyst]: Analyzing signals against ICP to generate Account Brief...")
    analyst_input = AnalystInput(
        icp=input_data.icp,
        company=input_data.company,
        signals=harvester_res.signals
    )
    
    try:
        analyst_res = run_research_analyst(analyst_input)
        timeline.append("Tool 2 [Research Analyst]: Account Brief constructed based strictly on evidence.")
    except Exception as e:
        timeline.append(f"Tool 2 [Research Analyst] Error: {str(e)}")
        return OrchestrationResponse(
            status="failure",
            message=f"Research Analyst failed: {str(e)}",
            harvested_signals=harvester_res,
            timeline=timeline
        )
    
    # 3. SENDER
    timeline.append("Tool 3 [Automated Sender]: Generating hyper-personalized message utilizing grounded signals...")
    sender_input = SenderInput(
        recipient_email=input_data.recipient_email,
        company=input_data.company,
        icp=input_data.icp,
        signals=harvester_res.signals,
        account_brief=analyst_res.account_brief
    )
    
    try:
        sender_res = run_outreach_sender(sender_input)
    except Exception as e:
        timeline.append(f"Tool 3 [Automated Sender] Error: {str(e)}")
        return OrchestrationResponse(
            status="failure",
            message=f"Outreach Sender failed: {str(e)}",
            harvested_signals=harvester_res,
            account_brief=analyst_res.account_brief,
            timeline=timeline
        )
    
    if sender_res.delivery_status == "sent":
        timeline.append(f"Tool 3 [Automated Sender]: Email successfully sent to {input_data.recipient_email}.")
        status = "success"
    else:
        timeline.append(f"Tool 3 [Automated Sender]: Email sending failed - {sender_res.provider_response}")
        status = "failure"
        
    return OrchestrationResponse(
        status=status,
        message="Workflow completed.",
        harvested_signals=harvester_res,
        account_brief=analyst_res.account_brief,
        outreach_result=sender_res,
        timeline=timeline
    )
