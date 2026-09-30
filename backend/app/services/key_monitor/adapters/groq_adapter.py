import httpx
from typing import Optional
from app.services.key_monitor.adapters.base import BaseProviderAdapter, AdapterResult, AdapterLiveInfo

class GroqAdapter(BaseProviderAdapter):
    provider_name = "groq"

    async def check_key(self, api_key: str) -> AdapterResult:
        url = "https://api.groq.com/openai/v1/models"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "User-Agent": "EduRAG-QuotaMonitor/1.0",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    resp_headers = response.headers

                    # Extract rate limit headers
                    req_rem = resp_headers.get("x-ratelimit-remaining-requests")
                    req_lim = resp_headers.get("x-ratelimit-limit-requests")
                    tok_rem = resp_headers.get("x-ratelimit-remaining-tokens")
                    tok_lim = resp_headers.get("x-ratelimit-limit-tokens")
                    reset_req = resp_headers.get("x-ratelimit-reset-requests")
                    reset_tok = resp_headers.get("x-ratelimit-reset-tokens")

                    live_info = AdapterLiveInfo(
                        requests_remaining=int(req_rem) if req_rem and req_rem.isdigit() else None,
                        requests_limit=int(req_lim) if req_lim and req_lim.isdigit() else None,
                        tokens_remaining=int(tok_rem) if tok_rem and tok_rem.isdigit() else None,
                        tokens_limit=int(tok_lim) if tok_lim and tok_lim.isdigit() else None,
                        reset_duration=reset_tok or reset_req,
                        tier_detected="Free Tier" if tok_lim and int(tok_lim) <= 200000 else "Standard / Pay-as-you-go"
                    )

                    return AdapterResult(
                        provider="groq",
                        valid=True,
                        status_code=200,
                        live_info=live_info,
                        raw_probe_summary={"models_count": len(response.json().get("data", []))}
                    )

                elif response.status_code == 401:
                    return AdapterResult(
                        provider="groq",
                        valid=False,
                        status_code=401,
                        error_code="INVALID_API_KEY",
                        error_message="The provided Groq API key could not be authenticated. Please verify your key on console.groq.com."
                    )
                elif response.status_code == 429:
                    return AdapterResult(
                        provider="groq",
                        valid=True,
                        status_code=429,
                        error_code="RATE_LIMIT_EXCEEDED",
                        error_message="Groq rate limit reached or daily token quota exhausted."
                    )
                else:
                    return AdapterResult(
                        provider="groq",
                        valid=False,
                        status_code=response.status_code,
                        error_code="HTTP_ERROR",
                        error_message=f"Groq API returned HTTP {response.status_code}: {response.text[:200]}"
                    )
        except Exception as e:
            return AdapterResult(
                provider="groq",
                valid=False,
                status_code=0,
                error_code="NETWORK_ERROR",
                error_message=f"Failed to connect to Groq API endpoint: {str(e)}"
            )
