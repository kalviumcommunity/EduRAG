from typing import Optional, Dict, Any, List
from app.services.key_monitor.cache import quota_cache
from app.services.key_monitor.published_limits import get_published_limits_for_provider, get_all_published_limits, PublishedLimitEntry
from app.services.key_monitor.adapters import get_adapter
from app.services.key_monitor.merger import ResponseMerger, UnifiedQuotaResponse
from app.core.logging import logger

class KeyQuotaMonitorService:
    @staticmethod
    async def check_api_key(provider: str, api_key: str, bypass_cache: bool = False) -> UnifiedQuotaResponse:
        """
        Executes the 15-step verification, live quota detection, published limit merger, and caching.
        """
        clean_provider = provider.strip().lower()
        clean_key = api_key.strip()

        if not clean_key:
            return UnifiedQuotaResponse(
                provider=clean_provider,
                fingerprint="none",
                valid=False,
                status="INVALID",
                error_code="EMPTY_KEY",
                error_message="API key cannot be empty.",
                calculated={"display_label": "No API key provided"},
                availability={"status": "invalid"}
            )

        # Step 2: Generate Fingerprint
        fingerprint = quota_cache.generate_fingerprint(clean_provider, clean_key)

        # Step 3 & 4: Check Cache
        if not bypass_cache:
            cached_data = quota_cache.get(fingerprint)
            if cached_data:
                logger.info(f"KeyQuotaMonitor: Cache HIT for fingerprint {fingerprint} ({clean_provider})")
                response_obj = UnifiedQuotaResponse(**cached_data)
                response_obj.cached = True
                return response_obj

        logger.info(f"KeyQuotaMonitor: Cache MISS for fingerprint {fingerprint}. Contacting {clean_provider}...")

        # Step 6 & 7: Adapter Probe
        try:
            adapter = get_adapter(clean_provider)
            adapter_result = await adapter.check_key(clean_key)
        except ValueError as ve:
            return UnifiedQuotaResponse(
                provider=clean_provider,
                fingerprint=fingerprint,
                valid=False,
                status="ERROR",
                error_code="UNSUPPORTED_PROVIDER",
                error_message=str(ve),
                calculated={"display_label": "Unsupported provider"},
                availability={"status": "error"}
            )
        except Exception as ex:
            logger.error(f"KeyQuotaMonitor: Adapter error for {clean_provider}: {ex}")
            return UnifiedQuotaResponse(
                provider=clean_provider,
                fingerprint=fingerprint,
                valid=False,
                status="ERROR",
                error_code="ADAPTER_EXCEPTION",
                error_message=f"An error occurred while probing provider {clean_provider}: {str(ex)}",
                calculated={"display_label": "Verification error"},
                availability={"status": "error"}
            )

        # Step 10: Fetch published limits
        published_limits = get_published_limits_for_provider(clean_provider)

        # Step 11 & 12: Merge & Calculate
        merged_response = ResponseMerger.merge(
            provider=clean_provider,
            fingerprint=fingerprint,
            adapter_result=adapter_result,
            published_limits=published_limits,
            is_cached=False
        )

        # Step 13: Store in cache with 30s TTL
        if merged_response.valid:
            quota_cache.set(fingerprint, merged_response.model_dump(), ttl_seconds=30)

        # Step 14 & 15: Raw key discarded by function return
        return merged_response

    @staticmethod
    def get_published_catalog() -> List[PublishedLimitEntry]:
        return get_all_published_limits()
