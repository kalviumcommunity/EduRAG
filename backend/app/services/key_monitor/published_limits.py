from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class PublishedLimitEntry(BaseModel):
    id: str
    provider: str
    model: Optional[str] = "all"
    tier: str  # Free, Pay-as-you-go, Tier 1, etc.
    limit_type: str  # tokens, requests, credits, rpd, rpm, tpm
    limit_value: float
    unit: str  # tokens, requests, credits
    window: str  # minute, day, month, total_signup
    source_type: str  # official_docs, official_api, scraping, curated_fallback
    source_url: str
    source_date: str
    last_verified_at: str
    confidence: str  # high, medium, verified
    notes: Optional[str] = None

# Curated and verified published limit database entries
PUBLISHED_LIMITS_CATALOG: List[PublishedLimitEntry] = [
    PublishedLimitEntry(
        id="groq-free-tokens-day",
        provider="groq",
        model="llama-3.3-70b-versatile",
        tier="Free",
        limit_type="tokens",
        limit_value=200000,
        unit="tokens",
        window="day",
        source_type="official_docs",
        source_url="https://console.groq.com/docs/rate-limits",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="Official Groq Free Developer Tier daily token allowance"
    ),
    PublishedLimitEntry(
        id="groq-free-rpm",
        provider="groq",
        model="all",
        tier="Free",
        limit_type="requests",
        limit_value=30,
        unit="requests",
        window="minute",
        source_type="official_docs",
        source_url="https://console.groq.com/docs/rate-limits",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="30 requests per minute limit across free models"
    ),
    PublishedLimitEntry(
        id="nvidia-nim-free-credits",
        provider="nvidia",
        model="all",
        tier="Free Sandbox",
        limit_type="credits",
        limit_value=1000,
        unit="credits",
        window="total_signup",
        source_type="official_docs",
        source_url="https://build.nvidia.com/",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="NVIDIA Build provides 1,000 free inference API credits per account"
    ),
    PublishedLimitEntry(
        id="gemini-free-rpd",
        provider="gemini",
        model="gemini-1.5-flash",
        tier="Free Tier",
        limit_type="requests",
        limit_value=1500,
        unit="requests",
        window="day",
        source_type="official_docs",
        source_url="https://ai.google.dev/pricing",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="Google AI Studio provides 1,500 Requests Per Day free on Gemini Flash"
    ),
    PublishedLimitEntry(
        id="gemini-free-rpm",
        provider="gemini",
        model="gemini-1.5-flash",
        tier="Free Tier",
        limit_type="requests",
        limit_value=15,
        unit="requests",
        window="minute",
        source_type="official_docs",
        source_url="https://ai.google.dev/pricing",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="15 requests per minute limit"
    ),
    PublishedLimitEntry(
        id="openrouter-free-tier",
        provider="openrouter",
        model=":free",
        tier="Free Tier",
        limit_type="requests",
        limit_value=200,
        unit="requests",
        window="day",
        source_type="official_docs",
        source_url="https://openrouter.ai/docs/limits",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="Free models on OpenRouter have a baseline 200 RPD allocation for verified keys"
    ),
    PublishedLimitEntry(
        id="openai-tier-1-rpm",
        provider="openai",
        model="gpt-4o-mini",
        tier="Tier 1",
        limit_type="requests",
        limit_value=500,
        unit="requests",
        window="minute",
        source_type="official_docs",
        source_url="https://platform.openai.com/docs/guides/rate-limits",
        source_date="2026-09-25",
        last_verified_at="2026-09-25",
        confidence="verified",
        notes="OpenAI Usage Tier 1 rate limits for lightweight production models"
    )
]

def get_published_limits_for_provider(provider: str) -> List[PublishedLimitEntry]:
    clean = provider.strip().lower()
    return [entry for entry in PUBLISHED_LIMITS_CATALOG if entry.provider.lower() == clean]

def get_all_published_limits() -> List[PublishedLimitEntry]:
    return PUBLISHED_LIMITS_CATALOG
