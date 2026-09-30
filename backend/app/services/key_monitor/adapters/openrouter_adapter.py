import httpx
from app.services.key_monitor.adapters.base import BaseProviderAdapter, AdapterResult, AdapterLiveInfo

class OpenRouterAdapter(BaseProviderAdapter):
    provider_name = "openrouter"

    async def check_key(self, api_key: str) -> AdapterResult:
        url = "https://openrouter.ai/api/v1/auth/key"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "User-Agent": "EduRAG-QuotaMonitor/1.0",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    data = response.json().get("data", {})
                    usage = data.get("usage", 0.0)
                    limit = data.get("limit")
                    is_free_tier = data.get("is_free_tier", False)
                    rate_limit = data.get("rate_limit", {})

                    live_info = AdapterLiveInfo(
                        credits_remaining=(limit - usage) if limit is not None else None,
                        credits_total=limit,
                        tier_detected="Free Tier" if is_free_tier else "Paid Tier / Credits",
                        reset_duration=rate_limit.get("interval")
                    )

                    return AdapterResult(
                        provider="openrouter",
                        valid=True,
                        status_code=200,
                        live_info=live_info,
                        raw_probe_summary=data
                    )
                elif response.status_code == 401:
                    return AdapterResult(
                        provider="openrouter",
                        valid=False,
                        status_code=401,
                        error_code="INVALID_API_KEY",
                        error_message="Invalid OpenRouter API key (sk-or-v1-...)."
                    )
                else:
                    return AdapterResult(
                        provider="openrouter",
                        valid=False,
                        status_code=response.status_code,
                        error_code="HTTP_ERROR",
                        error_message=f"OpenRouter API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
        except Exception as e:
            return AdapterResult(
                provider="openrouter",
                valid=False,
                status_code=0,
                error_code="NETWORK_ERROR",
                error_message=f"Failed to connect to OpenRouter endpoint: {str(e)}"
            )
