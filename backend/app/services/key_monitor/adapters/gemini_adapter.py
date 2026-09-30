import httpx
from app.services.key_monitor.adapters.base import BaseProviderAdapter, AdapterResult, AdapterLiveInfo

class GeminiAdapter(BaseProviderAdapter):
    provider_name = "gemini"

    async def check_key(self, api_key: str) -> AdapterResult:
        clean_key = api_key.strip()
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={clean_key}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    return AdapterResult(
                        provider="gemini",
                        valid=True,
                        status_code=200,
                        live_info=AdapterLiveInfo(
                            tier_detected="Google AI Studio Free Tier (1,500 RPD / 15 RPM)",
                            reset_duration="Midnight UTC daily reset"
                        ),
                        raw_probe_summary={"available_models": len(models)}
                    )
                elif response.status_code in (400, 403):
                    return AdapterResult(
                        provider="gemini",
                        valid=False,
                        status_code=response.status_code,
                        error_code="INVALID_API_KEY",
                        error_message="The provided Google Gemini API key is invalid, disabled, or lacks Generative Language API permissions."
                    )
                elif response.status_code == 429:
                    return AdapterResult(
                        provider="gemini",
                        valid=True,
                        status_code=429,
                        error_code="RESOURCE_EXHAUSTED",
                        error_message="Gemini free tier quota exhausted (1,500 requests/day limit hit).",
                        live_info=AdapterLiveInfo(
                            requests_remaining=0,
                            tier_detected="Daily Quota Exceeded"
                        )
                    )
                else:
                    return AdapterResult(
                        provider="gemini",
                        valid=False,
                        status_code=response.status_code,
                        error_code="HTTP_ERROR",
                        error_message=f"Gemini API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
        except Exception as e:
            return AdapterResult(
                provider="gemini",
                valid=False,
                status_code=0,
                error_code="NETWORK_ERROR",
                error_message=f"Failed to connect to Google Gemini API: {str(e)}"
            )
