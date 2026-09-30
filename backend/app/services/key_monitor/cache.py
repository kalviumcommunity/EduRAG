import time
import hashlib
from typing import Optional, Dict, Any

class KeyQuotaCache:
    """
    In-memory short TTL cache for API key validation and quota responses.
    Keys are stored as SHA-256 fingerprints of (provider + raw_key).
    Raw API keys are NEVER stored in the cache.
    """

    def __init__(self, default_ttl_seconds: int = 30):
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def generate_fingerprint(provider: str, api_key: str) -> str:
        clean_provider = provider.strip().lower()
        clean_key = api_key.strip()
        salted = f"{clean_provider}:{clean_key}"
        return hashlib.sha256(salted.encode("utf-8")).hexdigest()[:16]

    def get(self, fingerprint: str) -> Optional[Dict[str, Any]]:
        self._evict_expired()
        entry = self._cache.get(fingerprint)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._cache[fingerprint]
            return None
        return entry["data"]

    def set(self, fingerprint: str, data: Dict[str, Any], ttl_seconds: Optional[int] = None) -> None:
        self._evict_expired()
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        now = time.time()
        self._cache[fingerprint] = {
            "fingerprint": fingerprint,
            "data": data,
            "created_at": now,
            "expires_at": now + ttl,
        }

    def _evict_expired(self) -> None:
        now = time.time()
        expired_keys = [k for k, v in self._cache.items() if now > v["expires_at"]]
        for k in expired_keys:
            self._cache.pop(k, None)

quota_cache = KeyQuotaCache(default_ttl_seconds=30)
