import os
import re
from datetime import datetime
from typing import Dict, Any, List
import requests
import json

from backend.schemas import HarvesterResponse, Signal, SignalType

def parse_signal(title: str, snippet: str, url: str, source: str, date: str) -> Signal | None:
    text = (title + " " + snippet).lower()
    
    # Simple deterministic matching logic
    if any(k in text for k in ["raised", "funding", "series", "seed", "capital"]):
        return Signal(
            type="funding_round",
            summary=title,
            value="Funding Round Detected",
            date=date,
            source_url=url,
            source_name=source,
            confidence="high" if "series" in text or "raised $" in text else "medium"
        )
    if any(k in text for k in ["hires", "hiring", "headcount", "recruiting", "new roles"]):
        return Signal(
            type="hiring_trend",
            summary=title,
            value="Hiring Surge/Roles",
            date=date,
            source_url=url,
            source_name=source,
            confidence="high"
        )
    if any(k in text for k in ["appointed", "new vp", "new c", "joins board", "named as"]):
        return Signal(
            type="leadership_change",
            summary=title,
            value="Leadership Update",
            date=date,
            source_url=url,
            source_name=source,
            confidence="high"
        )
    if any(k in text for k in ["launches", "acquired", "expansion", "growth", "revenue"]):
        return Signal(
            type="growth",
            summary=title,
            value="Growth Indicator",
            date=date,
            source_url=url,
            source_name=source,
            confidence="medium"
        )
        
    return None

def fetch_tavily_signals(company: str, api_key: str) -> List[Signal]:
    url = "https://api.tavily.com/search"
    query = f"{company} company news AND (funding OR hiring OR leadership OR expansion)"
    payload = {
        "query": query,
        "search_depth": "basic",
        "api_key": api_key,
        "days": 90,
        "max_results": 5,
        "include_domains": ["techcrunch.com", "bloomberg.com", "forbes.com", "linkedin.com", "primenews.com", "yahoo.com"]
    }
    try:
        res = requests.post(url, json=payload, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print(f"Tavily search failed: {e}")
        return []
    
    signals = []
    for result in data.get("results", []):
        sig = parse_signal(
            title=result.get("title", ""),
            snippet=result.get("content", ""),
            url=result.get("url", ""),
            source=result.get("url", "").split("/")[2] if "url" in result else "Tavily Search",
            date=datetime.now().strftime("%Y-%m-%d") # Fallback to today since basic Tavily doesn't give date reliably
        )
        if sig:
            signals.append(sig)
    return signals

def fetch_serpapi_signals(company: str, api_key: str) -> List[Signal]:
    url = "https://serpapi.com/search"
    query = f"{company} AND (\"funding\" OR \"hiring\" OR \"appointed\" OR \"expansion\")"
    params = {
        "engine": "google_news",
        "q": query,
        "api_key": api_key,
        "num": 5
    }
    try:
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print(f"SerpAPI search failed: {e}")
        return []
        
    signals = []
    for news in data.get("news_results", []):
        sig = parse_signal(
            title=news.get("title", ""),
            snippet=news.get("snippet", ""),
            url=news.get("link", ""),
            source=news.get("source", "SerpAPI / Google News"),
            date=news.get("date", datetime.now().strftime("%Y-%m-%d"))
        )
        if sig:
            signals.append(sig)
    return signals


def run_signal_harvester(company: str) -> HarvesterResponse:
    """
    FETCH TARGET COMPANY SIGNALS (Tool 1) - LIVE MODE
    Deterministically fetches real buyer signals via public APIs.
    No LLMs allowed here.
    """
    tavily_key = os.getenv("TAVILY_API_KEY")
    serpapi_key = os.getenv("SERPAPI_KEY")
    
    signals = []
    if tavily_key and "your_tavily_api_key_here" not in tavily_key:
        signals.extend(fetch_tavily_signals(company, tavily_key))
    elif serpapi_key and "optional_serpapi_key_here" not in serpapi_key:
        signals.extend(fetch_serpapi_signals(company, serpapi_key))
        
    # Deduplicate by URL
    seen_urls = set()
    unique_signals = []
    for sig in signals:
        if sig.source_url not in seen_urls:
            unique_signals.append(sig)
            seen_urls.add(sig.source_url)
            
    # Empty result case if nothing matched cleanly
    return HarvesterResponse(company=company, signals=unique_signals)
