from schemas import AnalystInput, AnalystResponse
from groq import Groq
import os
import json

def run_research_analyst(input_data: AnalystInput) -> AnalystResponse:
    """
    RESEARCH & ACCOUNT BRIEF GENERATION (Tool 2)
    Generates a structured, role-aware brief that feeds the email writer with
    precise context: company momentum, role-specific pain, and a clear angle.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "your_groq_api_key" in api_key:
        raise ValueError("GROQ_API_KEY is not configured or invalid.")

    client = Groq(api_key=api_key)

    system_prompt = """You are a senior B2B account researcher preparing intelligence for a sales rep who will write a cold email.
Your output will be fed directly into an email draft. Write for the email writer — be specific, punchy, and role-aware.

OUTPUT FORMAT (plain text, 3 clearly labelled sections):

COMPANY MOMENT:
One sentence. What is happening at this company RIGHT NOW that signals buying urgency? Use the most impactful signal.
Example: "Acme just closed a $22M Series B and is scaling headcount by 60% over 6 months."

ROLE PAIN:
One or two sentences. What pressure does THIS contact's role create given that company moment?
Be specific to their job — a CTO worries about infra scaling, a CISO about attack surface, a VP Sales about pipeline efficiency.
Example (for CTO): "Rapid headcount growth at Acme means eng teams will outrun their security tooling before compliance reviews catch up."

OPENING HOOK:
One sentence. The best possible cold email opener for this contact — the sentence that will make them want to keep reading.
Reference the specific signal and the role pain together.
Example: "I saw Acme's Series B — scaling 60 engineers fast is exciting, but it usually means security posture falls 3 months behind headcount."

STRICT RULES:
- ONLY use information from the HARVESTED SIGNALS. Never invent data.
- Keep total output under 120 words.
- Be concrete — use numbers, names, and events from the signals. Generic = useless.
- If signals are empty or weak, say so explicitly in the COMPANY MOMENT section.
"""

    signals_json = json.dumps([s.model_dump() for s in input_data.signals], indent=2)
    prompt = f"""TARGET COMPANY: {input_data.company}
CONTACT NAME: {input_data.contact.name}
CONTACT ROLE: {input_data.contact.role}
IDEAL CUSTOMER PROFILE (ICP): {input_data.icp}
HARVESTED SIGNALS:
{signals_json}

Generate the account brief now."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=512,
        )
        brief = response.choices[0].message.content.strip()
        return AnalystResponse(account_brief=brief)
    except Exception as e:
        print(f"Error calling Groq in Analyst: {e}")
        raise ValueError(f"Failed to generate brief: {str(e)}")
