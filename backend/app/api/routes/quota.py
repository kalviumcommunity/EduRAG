from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.key_monitor.service import KeyQuotaMonitorService
from app.services.key_monitor.merger import UnifiedQuotaResponse
from app.services.key_monitor.published_limits import PublishedLimitEntry
from app.core.config import settings

router = APIRouter(prefix="/quota", tags=["Quota & Key Monitor"])

class KeyCheckRequest(BaseModel):
    provider: str = Field(..., description="Provider name e.g. groq, nvidia, openai, gemini, openrouter")
    api_key: str = Field(..., description="API key to verify and inspect quota")
    bypass_cache: Optional[bool] = False

@router.post("/check", response_model=UnifiedQuotaResponse)
async def check_api_key_quota(payload: KeyCheckRequest):
    """
    Check and monitor API key validity, extract live rate limits/quotas,
    merge with published documentation limits, and calculate metrics.
    """
    return await KeyQuotaMonitorService.check_api_key(
        provider=payload.provider,
        api_key=payload.api_key,
        bypass_cache=payload.bypass_cache or False
    )

@router.get("/published-limits", response_model=List[PublishedLimitEntry])
def list_published_limits():
    """
    Returns the verified published limit catalog for all supported AI providers.
    """
    return KeyQuotaMonitorService.get_published_catalog()

@router.get("/current", response_model=UnifiedQuotaResponse)
async def check_server_active_key():
    """
    Inspects and monitors the currently configured server LLM key from environment.
    """
    provider = settings.LLM_PROVIDER
    key = settings.LLM_API_KEY
    if not key:
        return UnifiedQuotaResponse(
            provider=provider,
            fingerprint="server_none",
            valid=False,
            status="INVALID",
            error_message="No active LLM API key configured in server environment.",
            calculated={"display_label": "No active server API key"}
        )
    return await KeyQuotaMonitorService.check_api_key(provider=provider, api_key=key)
