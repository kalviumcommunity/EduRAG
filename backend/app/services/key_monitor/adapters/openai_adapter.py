import httpx
from app.services.key_monitor.adapters.base import BaseProviderAdapter, AdapterResult, AdapterLiveInfo

class OpenAIAdapter(BaseProviderAdapter):
    provider_name = "openai"

    async def check_key(self, api_key: str) -> AdapterResult:
        url = "https://api.openai.com/v1/models"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "User-Agent": "EduRAG-QuotaMonitor/1.0",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    resp_headers = response.headers
                    req_rem = resp_headers.get("x-ratelimit-remaining-requests")
                    req_lim = resp_headers.get("x-ratelimit-limit-requests")
                    reset_req = resp_headers.get("x-ratelimit-reset-requests")

                    live_info = AdapterLiveInfo(
                        requests_remaining=int(req_rem) if req_rem and req_rem.isdigit() else None,
                        requests_limit=int(req_lim) if req_lim and req_lim.isdigit() else None,
                        reset_duration=reset_req,
                        tier_detected="Active Account"
                    )

                    return AdapterResult(
                        provider="openai",
                        valid=True,
                        status_code=200,
                        live_info=live_info,
                        raw_probe_summary={"models_count": len(response.json().get("data", []))}
                    )
                elif response.status_code == 401:
                    return AdapterResult(
                        provider="openai",
                        valid=False,
                        status_code=401,
                        error_code="INVALID_API_KEY",
                        error_message="Incorrect or revoked OpenAI API key."
                    )
                elif response.status_code == 429:
                    error_json = response.json().get("error", {})
                    code = error_json.get("code", "rate_limit_exceeded")
                    msg = error_json.get("message", "OpenAI quota exceeded or rate limit reached.")
                    return AdapterResult(
                        provider="openai",
                        valid=True if code == "insufficient_quota" else True,
                        status_code=429,
                        error_code=code.upper(),
                        error_message=msg,
                        live_info=AdapterLiveInfo(
                            requests_remaining=0,
                            tier_detected="Quota Exhausted"
                        )
                    )
                else:
                    return AdapterResult(
                        provider="openai",
                        valid=False,
                        status_code=response.status_code,
                        error_code="HTTP_ERROR",
                        error_message=f"OpenAI API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
        except Exception as e:
            return AdapterResult(
                provider="openai",
                valid=False,
                status_code=0,
                error_code="NETWORK_ERROR",
                error_message=f"Failed to connect to OpenAI API: {str(e)}"
            )
