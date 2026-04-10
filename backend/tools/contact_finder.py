import os
import json
import requests
from typing import List
from groq import Groq
from schemas import Contact


# ── Hunter.io Domain Search ─────────────────────────────────────────────────

def _company_to_domain(company: str) -> str:
    """
    Use Hunter's company search to resolve a company name → domain.
    Returns the domain string, or empty string on failure.
    """
    api_key = os.getenv("HUNTER_API_KEY", "")
    if not api_key:
        return ""
    try:
        res = requests.get(
            "https://api.hunter.io/v2/domain-search",
            params={"company": company, "api_key": api_key},
            timeout=10,
        )
        data = res.json()
        return data.get("data", {}).get("domain", "")
    except Exception as e:
        print(f"[Hunter] Domain lookup error: {e}")
        return ""


def _hunter_domain_search(domain: str) -> List[Contact]:
    """
    Call Hunter.io Domain Search API and return ALL contacts found.
    No cap — return everything Hunter has for the domain.
    """
    api_key = os.getenv("HUNTER_API_KEY", "")
    if not api_key:
        return []

    contacts = []
    try:
        res = requests.get(
            "https://api.hunter.io/v2/domain-search",
            params={
                "domain": domain,
                "api_key": api_key,
                "limit": 10,    # Free plan cap — upgrade for more
                "type": "personal",
            },
            timeout=15,
        )

        if res.status_code != 200:
            print(f"[Hunter] API returned {res.status_code}: {res.text[:200]}")
            return []

        data = res.json().get("data", {})
        emails = data.get("emails", [])
        print(f"[Hunter] Found {len(emails)} emails for domain: {domain}")

        for email_obj in emails:
            first = email_obj.get("first_name") or ""
            last = email_obj.get("last_name") or ""
            name = f"{first} {last}".strip() or "Unknown"
            role = email_obj.get("position") or "Decision Maker"
            email = email_obj.get("value") or ""
            linkedin = email_obj.get("linkedin") or None
            confidence = email_obj.get("confidence", 0)

            # Only include emails with reasonable confidence (≥ 50%)
            if email and confidence >= 50:
                contacts.append(Contact(
                    name=name,
                    role=role,
                    email=email,
                    linkedin=linkedin,
                ))

        # Sort: prioritize senior roles at the top
        PRIORITY_ROLES = ["ceo", "cto", "ciso", "coo", "cfo", "vp", "head", "director", "founder"]
        def role_priority(c: Contact) -> int:
            r = c.role.lower()
            for i, keyword in enumerate(PRIORITY_ROLES):
                if keyword in r:
                    return i
            return len(PRIORITY_ROLES)

        contacts.sort(key=role_priority)
        return contacts

    except Exception as e:
        print(f"[Hunter] Search error for domain '{domain}': {e}")
        return []


# ── Groq Fallback ────────────────────────────────────────────────────────────

def _groq_fallback(company: str) -> List[Contact]:
    """
    Fallback: Use Groq to generate plausible decision-maker contacts
    when Hunter.io is unavailable or returns no results.
    Clearly labelled as estimated/simulated in the role field.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "your_groq_api_key" in api_key:
        print("[Groq Fallback] GROQ_API_KEY not configured.")
        return []

    client = Groq(api_key=api_key)
    system_prompt = """You are a B2B contact discovery tool. 
Generate realistic decision-maker contacts for the given company.
Focus on: CTO, VP Engineering, Head of Security, CISO, CEO, COO.
Return valid JSON with key "contacts" containing a list. Each item must have:
- "name": Full name (realistic for the company's region)
- "role": Job title
- "email": Plausible corporate email (firstname.lastname@company.com pattern)
- "linkedin": Plausible LinkedIn URL or null

Return up to 5 contacts. Mark each role with "[estimated]" prefix."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"TARGET COMPANY: {company}"}
            ],
            temperature=0.2,
            max_tokens=600,
            response_format={"type": "json_object"},
        )
        raw_text = response.choices[0].message.content.strip()
        data = json.loads(raw_text)
        contacts = []
        for c in data.get("contacts", []):
            contacts.append(Contact(
                name=c.get("name", "Unknown"),
                role=c.get("role", "Decision Maker"),
                email=c.get("email", ""),
                linkedin=c.get("linkedin"),
            ))
        print(f"[Groq Fallback] Generated {len(contacts)} estimated contacts for: {company}")
        return contacts
    except Exception as e:
        print(f"[Groq Fallback] Error: {e}")
        return []


def _guess_domains(company: str) -> List[str]:
    """
    Generate plausible domain guesses from a company name.
    e.g. "Acme Corp" -> ["acmecorp.com", "acme.com", "acme.co", "acme.io"]
    """
    import re
    # Normalise: lowercase, remove common suffixes
    name = company.lower().strip()
    name = re.sub(r'\b(inc|corp|co|ltd|llc|limited|technologies|technology|tech|solutions|group|holdings|services|global|ai)\b', '', name)
    name = re.sub(r'[^a-z0-9]', '', name)  # strip spaces, punctuation
    if not name:
        return []
    return [
        f"{name}.com",
        f"{name}.ai",
        f"{name}.io",
        f"{name}.co",
    ]


def _score_contacts_against_icp(contacts: List[Contact], company: str, icp: str) -> List[Contact]:
    """Uses Groq to evaluate which contacts are the strongest targets for the given ICP."""
    if not icp or not contacts:
        return contacts
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or "your_groq_api_key" in api_key:
        return contacts
        
    client = Groq(api_key=api_key)
    
    contact_lines = [f"[{i}] {c.name} - {c.role}" for i, c in enumerate(contacts)]
    
    system_prompt = """You are a B2B sales strategist. 
Given a list of decision makers at a company and an Ideal Customer Profile (ICP) for what you are selling, determine which contacts are the BEST targets.
Return a JSON object with a single key "matches" containing a list of integers (the indices of the contacts that are strong ICP matches based on their role).
If none are relevant, return an empty list."""

    prompt = f"COMPANY: {company}\nICP: {icp}\n\nCONTACTS:\n" + "\n".join(contact_lines)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=600,
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content.strip())
        matches = set(data.get("matches", []))
        
        for i, c in enumerate(contacts):
            c.is_icp_match = (i in matches)
            
    except Exception as e:
        print(f"[ICP Scorer] Failed to score contacts: {e}")
        
    return contacts


# ── Main Entry Point ──────────────────────────────────────────────────────────

def run_contact_discovery(company: str, icp: str = "") -> List[Contact]:
    """
    CONTACT DISCOVERY (Step 1) — Hunter.io first, Groq fallback.

    Chain:
    1. Hunter company name → domain lookup → domain search
    2. Hunter domain guesses (acme.com, acme.ai, acme.io, acme.co)
    3. Groq-generated estimated contacts as final fallback
    """
    hunter_key = os.getenv("HUNTER_API_KEY", "").strip()

    if hunter_key:
        print(f"[ContactFinder] Using Hunter.io for: {company}")

        # Step 1a: Try Hunter's own company→domain resolution
        domain = _company_to_domain(company)

        if domain:
            print(f"[ContactFinder] Hunter resolved domain: {domain}")
            contacts = _hunter_domain_search(domain)
            if contacts:
                print(f"[ContactFinder] Hunter returned {len(contacts)} verified contact(s).")
                return _score_contacts_against_icp(contacts, company, icp)

        # Step 1b: Try guessed domain patterns
        print(f"[ContactFinder] Trying guessed domains for: {company}")
        for guessed in _guess_domains(company):
            print(f"[ContactFinder] Trying domain: {guessed}")
            contacts = _hunter_domain_search(guessed)
            if contacts:
                print(f"[ContactFinder] Hunter returned {len(contacts)} contact(s) via {guessed}")
                return _score_contacts_against_icp(contacts, company, icp)

        print("[ContactFinder] Hunter returned 0 results across all domain attempts. Falling back to Groq.")
    else:
        print("[ContactFinder] HUNTER_API_KEY not set. Using Groq estimates.")

    contacts_out = _groq_fallback(company)
    return _score_contacts_against_icp(contacts_out, company, icp)
