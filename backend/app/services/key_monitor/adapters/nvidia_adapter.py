import httpx
from app.services.key_monitor.adapters.base import BaseProviderAdapter, AdapterResult, AdapterLiveInfo

class NvidiaAdapter(BaseProviderAdapter):
    provider_name = "nvidia"

    async def check_key(self, api_key: str) -> AdapterResult:
        url = "https://integrate.api.nvidia.com/v1/models"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "Accept": "application/json",
            "User-Agent": "EduRAG-QuotaMonitor/1.0",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    data = response.json()
                    models_count = len(data.get("data", []))

                    # NVIDIA API does not broadcast account balance headers in /v1/models
                    live_info = AdapterLiveInfo(
                        tier_detected="NVIDIA Build Active API (1M Context / Hybrid MoE)",
                        reset_duration="Account Active",
                    )

                    return AdapterResult(
                        provider="nvidia",
                        valid=True,
                        status_code=200,
                        live_info=live_info,
                        raw_probe_summary={"available_models_count": models_count}
                    )

                elif response.status_code == 401:
                    return AdapterResult(
                        provider="nvidia",
                        valid=False,
                        status_code=401,
                        error_code="INVALID_API_KEY",
                        error_message="The provided NVIDIA API key (nvapi-...) is invalid or expired."
                    )
                elif response.status_code in (402, 429):
                    return AdapterResult(
                        provider="nvidia",
                        valid=True,
                        status_code=response.status_code,
                        error_code="CREDITS_EXHAUSTED",
                        error_message="NVIDIA free trial credits have been fully exhausted or rate limit hit.",
                        live_info=AdapterLiveInfo(
                            credits_total=1000.0,
                            credits_remaining=0.0,
                            tier_detected="Exhausted Sandbox"
                        )
                    )
                else:
                    return AdapterResult(
                        provider="nvidia",
                        valid=False,
                        status_code=response.status_code,
                        error_code="HTTP_ERROR",
                        error_message=f"NVIDIA API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
        except Exception as e:
            return AdapterResult(
                provider="nvidia",
                valid=False,
                status_code=0,
                error_code="NETWORK_ERROR",
                error_message=f"Failed to connect to NVIDIA API endpoint: {str(e)}"
            )
