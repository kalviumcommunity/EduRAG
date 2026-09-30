import time
from typing import Dict, Any

class AppUsageTracker:
    """
    Tracks live in-application token and request usage per provider across the active session/day.
    """
    def __init__(self):
        self._usage: Dict[str, Dict[str, Any]] = {}

    def record_usage(self, provider: str, tokens: int = 0, requests: int = 1) -> None:
        clean = provider.strip().lower()
        if clean not in self._usage:
            self._usage[clean] = {
                "requests": 0,
                "tokens": 0,
                "credits_estimated": 0.0,
                "last_active": time.time(),
            }
        
        self._usage[clean]["requests"] += requests
        self._usage[clean]["tokens"] += tokens
        # For NVIDIA NIM: roughly 1 request/completion ~ 0.5 - 1.0 credit equivalent
        self._usage[clean]["credits_estimated"] += round(max(0.5, tokens / 800.0), 2)
        self._usage[clean]["last_active"] = time.time()

    def get_usage(self, provider: str) -> Dict[str, Any]:
        clean = provider.strip().lower()
        return self._usage.get(clean, {
            "requests": 0,
            "tokens": 0,
            "credits_estimated": 0.0,
            "last_active": time.time(),
        })

usage_tracker = AppUsageTracker()
