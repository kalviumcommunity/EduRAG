from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AdapterLiveInfo(BaseModel):
    requests_remaining: Optional[int] = None
    requests_limit: Optional[int] = None
    tokens_remaining: Optional[int] = None
    tokens_limit: Optional[int] = None
    credits_remaining: Optional[float] = None
    credits_total: Optional[float] = None
    reset_at: Optional[str] = None
    reset_duration: Optional[str] = None
    tier_detected: Optional[str] = None
    extra_headers: Optional[Dict[str, str]] = None

class AdapterResult(BaseModel):
    provider: str
    valid: bool
    status_code: int
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    live_info: Optional[AdapterLiveInfo] = None
    raw_probe_summary: Optional[Dict[str, Any]] = None

class BaseProviderAdapter(ABC):
    provider_name: str

    @abstractmethod
    async def check_key(self, api_key: str) -> AdapterResult:
        """
        Probe provider endpoint with the given API key, detect valid/invalid/quota exhaustion,
        and extract live rate-limit headers and quota fields.
        """
        pass
