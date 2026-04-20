from backend.schemas import SenderInput, SenderResponse
from groq import Groq
import os
import json
import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import base64
def run_outreach_sender(input_data: SenderInput) -> SenderResponse:
    """
    HYPER-PERSONALIZED OUTREACH SENDER (Tool 3) - LIVE MODE
    Drafts an email referencing the real signals and sends it automatically via SMTP.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
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

    # ── Role-specific writing guidance ──
    role = input_data.contact.role.lower()
    if any(x in role for x in ["cto", "chief technology", "vp eng", "head of eng", "engineering"]):
        role_angle = "They own: infrastructure reliability, dev velocity, build vs buy decisions, and technical debt. Frame value around engineering speed, scalability, or developer productivity."
    elif any(x in role for x in ["ciso", "security", "infosec"]):
        role_angle = "They own: threat surface, compliance posture, incident response, and board-level risk conversations. Frame value around reducing exposure, audit readiness, or breach prevention."
    elif any(x in role for x in ["coo", "operations", "head of ops"]):
        role_angle = "They own: operational efficiency, process automation, and cross-functional execution. Frame value around reducing friction or scaling without headcount."
    elif any(x in role for x in ["cfo", "finance", "vp finance"]):
        role_angle = "They own: unit economics, cost predictability, and ROI on tools. Frame value around cost savings, payback period, or reducing risk exposure."
    elif any(x in role for x in ["ceo", "founder", "president", "co-founder"]):
        role_angle = "They own: company direction, growth, and existential risk. Frame value around competitive edge, revenue impact, or strategic risk reduction."
    elif any(x in role for x in ["vp sales", "head of sales", "revenue", "crm", "growth"]):
        role_angle = "They own: pipeline velocity, rep productivity, and quota attainment. Frame value around shortening sales cycles or improving conversion."
    elif any(x in role for x in ["vp product", "head of product", "product manager"]):
        role_angle = "They own: roadmap prioritization, feature adoption, and product-market fit. Frame value around accelerating shipping or reducing engineering waste."
    else:
        role_angle = "Focus on the most direct business outcome their role is measured on."

    system_prompt = f"""You are an elite B2B cold email writer. You write short, high-converting outreach emails that feel like they came from a sharp senior sales rep — not a template bot.

CONTACT ROLE CONTEXT:
{role_angle}

YOUR OBJECTIVE:
Write an engaging, detailed, and highly personalized cold email that will make {input_data.contact.name} ({input_data.contact.role}) want to reply. You should build a strong business case using the provided account brief and signals.

OUTPUT: Return ONLY valid JSON with exactly two keys: "subject" and "body".

━━━ SUBJECT LINE RULES ━━━
- 4–8 words. Sentence case (not Title Case).
- Reference a specific event OR ask a direct question OR make a bold, curious statement.
- NEVER use: "Quick question", "Following up", "Introduction", "Partnership", "Synergies"
- Great examples:
  ✓ "Congrats on the raise — quick thought"
  ✓ "40 new engineers in 6 months?"
  ✓ "Your Series B and one security gap"
  ✓ "How Notion handled this exact scaling problem"

━━━ EMAIL BODY RULES ━━━
Structure (follow this strictly):

LINE 1 — Salutation & Hook: Open with exactly "Hi [First Name]," followed by a newline. Then immediately reference the specific, named event from the signals.
  ✓ "Hi Priya,\n\nSaw DataStack's $18M raise last week. Nice."
  ✗ "I hope you're doing well."
  ✗ "I hope you're doing well."
  ✗ "I came across your profile and..."

LINE 2 — Role pain: One sentence connecting that signal to the specific pressure their role owns.
  ✓ "That kind of headcount acceleration usually means your security tooling falls 3–4 months behind — especially around access controls and onboarding."
  ✗ "This can cause challenges for many companies."

LINE 3 — Solution & Business Case: 2-3 sentences. Detail exactly what you do, how it solves their pain, and the concrete outcome. Use the Account Brief to tailor this perfectly to their scenario.
  ✓ "We've developed a platform that helps engineering orgs at that exact scale enforce zero-trust access policies in one sprint rather than a quarter, without bottlenecking dev velocity. We integrate directly into AWS to map unmanaged resources immediately."

LINE 4 — CTA & Attachment Reference: Ask for a 15-minute call. Low friction, specific. IF there is an attachment, mention it here (e.g., "Please view the attached document for more details").
  ✓ "Worth 15 minutes this week to walk through how this applies to your current scale? Please view the attached document for an overview."

LINE 5 — Sign-off: Use the EXACT Sign-off format provided below.
  ✓ "Best regards,\n{input_data.sender_name}\n{input_data.sender_designation} - {input_data.sender_company}"

━━━ HARD LIMITS ━━━
- Aim for roughly 150 - 200 words. Make it detailed but highly readable.
- No bullet points.
- No filler phrases: "I hope", "reaching out", "touch base", "circle back", "leverage", "synergy", "value-add"
- Use short paragraphs (max 3 sentences per paragraph).
- The sign-off must exactly be the designation and company if provided.
"""

    signals_summary = "\n".join([
        f"- [{s.type.upper()}] {s.summary} (Source: {s.source_name}, Date: {s.date})"
        for s in input_data.signals[:5]  # cap at top 5 signals
    ])

    prompt = f"""Write the cold email now.

TARGET COMPANY: {input_data.company}
CONTACT: {input_data.contact.name} — {input_data.contact.role}
ICP (what we sell): {input_data.icp}
HAS ATTACHMENTS: {"yes" if input_data.attachments else "no"}

ACCOUNT BRIEF (analyst intelligence):
{input_data.account_brief}

KEY SIGNALS (use the most specific one to open with):
{signals_summary}

Return JSON only. No explanation."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.55,
            max_tokens=600,
            response_format={"type": "json_object"},
        )
        raw_text = response.choices[0].message.content.strip()
        email_data = json.loads(raw_text)
        subject = email_data.get("subject", "").strip()
        body = email_data.get("body", "").strip()
    except Exception as e:
        print(f"Error parsing Groq response in Sender: {e}")
        raise ValueError(f"Email generation failed: {e}")
    
    # SEND EMAIL VIA SMTP
    if not smtp_username or not smtp_password:
        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="failed",
            provider_response="SMTP credentials are missing or invalid. Email not sent.",
            timestamp=timestamp
        )
        
    try:
        msg = MIMEMultipart()
        msg["From"] = f"FireReach Agent <{smtp_username}>"
        msg["To"] = input_data.contact.email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Attachments
        if input_data.attachments:
            for file in input_data.attachments:
                try:
                    file_data = base64.b64decode(file.data_base64)
                    part = MIMEApplication(file_data, Name=file.filename)
                    part['Content-Disposition'] = f'attachment; filename="{file.filename}"'
                    msg.attach(part)
                except Exception as e:
                    print(f"Error attaching {file.filename}: {e}")

        # Connect & Send
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()

        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="sent",
            provider_response=f"Sent via SMTP ({smtp_server})",
            timestamp=timestamp
        )
    except Exception as e:
        print(f"SMTP delivery error: {e}")
        return SenderResponse(
            subject=subject,
            body=body,
            delivery_status="failed",
            provider_response=str(e),
            timestamp=timestamp
        )
