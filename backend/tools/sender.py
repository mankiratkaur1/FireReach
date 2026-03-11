from schemas import SenderInput, SenderResponse
from groq import Groq
import os
import json
import datetime
import resend

def run_outreach_sender(input_data: SenderInput) -> SenderResponse:
    """
    HYPER-PERSONALIZED OUTREACH SENDER (Tool 3) - LIVE MODE
    Drafts an email referencing the real signals and sends it automatically via Resend.
    """
    resend.api_key = os.getenv("RESEND_API_KEY")
    resend_from = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
    groq_key = os.getenv("GROQ_API_KEY")
    
    timestamp = datetime.datetime.now().isoformat()
    
    # Check if signals are empty or weak (Safeguard check)
    if not input_data.signals:
        return SenderResponse(
            subject="",
            body="",
            delivery_status="skipped",
            provider_response="Skipped execution: No strong harvested signals found.",
            timestamp=timestamp
        )

    if not groq_key or "your_groq_api_key" in groq_key:
        raise ValueError("GROQ_API_KEY is not configured.")
    
    client = Groq(api_key=groq_key)
    
    system_prompt = """You are FireReach, a precise autonomous SDR outreach email writer.
Your objective is to draft a hyper-personalized, concise cold email to the target company.
You must return your output strictly in JSON format with two keys: "subject" and "body".

STRICT RULES:
1. You MUST explicitly reference the provided harvested signals in the email body.
2. Do NOT use generic email templates. Personalize directly from the signals.
3. Keep the email concise (under 120 words).
4. Do NOT hallucinate signals or facts.
5. Provide a compelling "subject" line.
6. Return ONLY valid JSON. No markdown, no code fences, no extra text.
"""
    
    signals_json = json.dumps([s.model_dump() for s in input_data.signals], indent=2)
    prompt = f"""TARGET COMPANY: {input_data.company}
RECIPIENT EMAIL: {input_data.recipient_email}
ICP: {input_data.icp}
ACCOUNT BRIEF: {input_data.account_brief}
SIGNALS: {signals_json}"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )
        raw_text = response.choices[0].message.content.strip()
        email_data = json.loads(raw_text)
        subject = email_data.get("subject", "")
        body = email_data.get("body", "")
    except Exception as e:
        print(f"Error parsing Groq response in Sender: {e}")
        raise ValueError(f"Email generation failed: {e}")
    
    # SEND EMAIL VIA RESEND - STRICT LIVE CHECK
    if not resend.api_key or "your_resend_api_key" in resend.api_key:
        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="failed",
            provider_response="RESEND_API_KEY is missing or invalid. Email not sent.",
            timestamp=timestamp
        )
        
    try:
        r = resend.Emails.send({
            "from": f"FireReach Agent <{resend_from}>",
            "to": [input_data.recipient_email],
            "subject": subject,
            "text": body,
        })
        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="sent",
            provider_response=f"Resend ID: {r.get('id', 'Unknown ID')}",
            timestamp=timestamp
        )
    except Exception as e:
        print(f"Resend delivery error: {e}")
        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="failed",
            provider_response=str(e),
            timestamp=timestamp
        )
