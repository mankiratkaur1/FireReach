from schemas import AnalystInput, AnalystResponse
from groq import Groq
import os
import json

def run_research_analyst(input_data: AnalystInput) -> AnalystResponse:
    """
    RESEARCH & ACCOUNT BRIEF GENERATION (Tool 2) - LIVE MODE
    Uses Groq (Llama 3) to analyze harvested signals and generate a 2-paragraph account brief.
    Must ONLY use provided signals.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "your_groq_api_key" in api_key:
        raise ValueError("GROQ_API_KEY is not configured or invalid.")
    
    client = Groq(api_key=api_key)
    
    system_prompt = """You are FireReach, a precise autonomous SDR outreach agent.
Your objective is to generate exactly a 2-paragraph Account Brief.
Paragraph 1: Explain why this account is relevant right now, citing specific evidence from the signals.
Paragraph 2: Explain likely pain points and strategic alignment with the provided ICP.

STRICT RULES:
1. You must reason ONLY from the structured HARVESTED SIGNALS provided.
2. Never invent or hallucinate live company events.
3. Keep it to exactly two concise paragraphs.
4. If the signals are weak or empty, state that there is insufficient data to formulate a strong thesis.
"""
    
    signals_json = json.dumps([s.model_dump() for s in input_data.signals], indent=2)
    prompt = f"""TARGET COMPANY: {input_data.company}
IDEAL CUSTOMER PROFILE (ICP): {input_data.icp}
HARVESTED SIGNALS: {signals_json}"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1024,
        )
        brief = response.choices[0].message.content.strip()
        return AnalystResponse(account_brief=brief)
    except Exception as e:
        print(f"Error calling Groq in Analyst: {e}")
        raise ValueError(f"Failed to generate brief due to error: {str(e)}")
