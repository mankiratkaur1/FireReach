import os
from dotenv import load_dotenv
from typing import List

from backend.schemas import AgentTargetInput, OrchestrationResponse, AnalystInput, SenderInput, OutreachLogEntry
from backend.tools.harvester import run_signal_harvester
from backend.tools.analyst import run_research_analyst
from backend.tools.sender import run_outreach_sender
from backend.tools.contact_finder import run_contact_discovery

load_dotenv()

def execute_firereach_agent(input_data: AgentTargetInput) -> OrchestrationResponse:
    timeline: List[str] = []
    timeline.append(f"Started execution for target: {input_data.company}")

    # 1. CONTACT DISCOVERY — skip if pre-selected contacts provided
    if input_data.contacts and len(input_data.contacts) > 0:
        contacts = input_data.contacts
        timeline.append(f"Step 1 [Contact Discovery]: Using {len(contacts)} pre-selected contact(s) from UI.")
    else:
        timeline.append("Step 1 [Contact Discovery]: Searching for key decision makers...")
        try:
            contacts = run_contact_discovery(input_data.company)
        except Exception as e:
            return OrchestrationResponse(
                status="failure",
                message=f"Contact Discovery failed: {str(e)}",
                timeline=timeline
            )
        if not contacts:
            timeline.append("Step 1 [Contact Discovery]: No contacts found. Safely halting.")
            return OrchestrationResponse(
                status="failure",
                message="No contacts found for target company. Aborting.",
                timeline=timeline
            )
        timeline.append(f"Step 1 [Contact Discovery]: Found {len(contacts)} target decision maker(s).")
    
    # 2. SIGNAL HARVESTER
    timeline.append("Step 2 [Signal Harvester]: Fetching deterministic buyer signals via live APIs...")
    try:
        harvester_res = run_signal_harvester(input_data.company)
    except Exception as e:
        return OrchestrationResponse(
            status="failure",
            message=f"Signal Harvester failed: {str(e)}",
            timeline=timeline,
            contacts_targeted=contacts
        )
    
    signals = harvester_res.signals if harvester_res else []
    if not signals:
        timeline.append("Step 2 [Signal Harvester]: No strong signals found on public web, continuing with limited context.")
    else:
        timeline.append(f"Step 2 [Signal Harvester]: Successfully captured {len(signals)} live signal(s).")

    outreach_logs = []
    
    # LOOP FOR EACH CONTACT
    for i, contact in enumerate(contacts, 1):
        timeline.append(f"--- Processing Contact {i}/{len(contacts)}: {contact.name} ({contact.role}) ---")
        
        # 3. ANALYST
        timeline.append(f"Step 3 [Research Analyst for {contact.name}]: Analyzing signals tailored to role...")
        analyst_input = AnalystInput(
            icp=input_data.icp,
            company=input_data.company,
            contact=contact,
            signals=signals
        )
        
        try:
            analyst_res = run_research_analyst(analyst_input)
            timeline.append("Step 3 [Research Analyst]: Account Brief constructed.")
        except Exception as e:
            timeline.append(f"Step 3 [Research Analyst] Error: {str(e)}")
            continue

        # 4 & 5. SENDER
        timeline.append(f"Step 4/5 [Automated Sender for {contact.name}]: Drafting and dispatching highly personalized email...")
        sender_input = SenderInput(
            contact=contact,
            company=input_data.company,
            icp=input_data.icp,
            signals=signals,
            account_brief=analyst_res.account_brief,
            attachments=input_data.attachments,
            sender_name=input_data.sender_name,
            sender_company=input_data.sender_company,
            sender_designation=input_data.sender_designation
        )
        
        try:
            sender_res = run_outreach_sender(sender_input)
            
            # Determine the key signal used (for the log map)
            key_sig = signals[0].summary if signals else "Curiosity/No-Signal"
            
            log_entry = OutreachLogEntry(
                contact_name=contact.name,
                role=contact.role,
                email=contact.email,
                status=sender_res.delivery_status,
                subject=sender_res.subject,
                key_signal=key_sig,
                body=sender_res.body
            )
            outreach_logs.append(log_entry)
            
            if sender_res.delivery_status == "sent":
                timeline.append(f"Step 4/5: Successfully sent email to {contact.email}.")
            else:
                timeline.append(f"Step 4/5: Dispatch failed/skipped to {contact.email} ({sender_res.provider_response}).")
                
        except Exception as e:
            timeline.append(f"Step 4/5 Error: {str(e)}")
            continue
            
    # Check overall success
    status = "success" if len(outreach_logs) > 0 else "failure"
    msg = "Workflow completed fully." if status == "success" else "Workflow aborted/failed across contacts."

    return OrchestrationResponse(
        status=status,
        message=msg,
        harvested_signals=harvester_res,
        contacts_targeted=contacts,
        outreach_logs=outreach_logs,
        timeline=timeline
    )
