from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.services.key_monitor.adapters.base import AdapterResult
from app.services.key_monitor.published_limits import PublishedLimitEntry

class LiveMetric(BaseModel):
    remaining: Optional[float] = None
    limit: Optional[float] = None
    used: Optional[float] = None
    reset_at: Optional[str] = None
    reset_duration: Optional[str] = None
    unit: str = "count"
    source: str = "LIVE (Provider API/Headers)"

class PublishedMetric(BaseModel):
    limit_value: float
    unit: str
    window: str
    tier: str
    source_type: str
    source_url: str
    verified_at: str
    notes: Optional[str] = None
    source: str = "PUBLISHED (Official Documentation)"

class CalculatedUsage(BaseModel):
    percentage_used: Optional[float] = None
    used_amount: Optional[float] = None
    remaining_amount: Optional[float] = None
    total_amount: Optional[float] = None
    unit: str = ""
    is_estimated: bool = False
    display_label: str = ""

class UnifiedQuotaResponse(BaseModel):
    provider: str
    fingerprint: str
    valid: bool
    status: str  # VALID, INVALID, EXHAUSTED, ERROR
    tier: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    
    # Clean Separation of Live vs Published
    live: Dict[str, Any] = {}
    published: List[PublishedMetric] = []
    
    # Safe calculation for Progress Bar
    calculated: CalculatedUsage
    
    # Explicit availability tracking (Never hallucinate)
    availability: Dict[str, str] = {}
    cached: bool = False

class ResponseMerger:
    @staticmethod
    def merge(
        provider: str,
        fingerprint: str,
        adapter_result: AdapterResult,
        published_limits: List[PublishedLimitEntry],
        is_cached: bool = False
    ) -> UnifiedQuotaResponse:
        
        # 1. Base status & validation
        if not adapter_result.valid:
            return UnifiedQuotaResponse(
                provider=provider,
                fingerprint=fingerprint,
                valid=False,
                status="INVALID" if adapter_result.error_code == "INVALID_API_KEY" else "ERROR",
                error_code=adapter_result.error_code,
                error_message=adapter_result.error_message,
                calculated=CalculatedUsage(display_label="Invalid API Key"),
                availability={"status": "invalid"},
                cached=is_cached
            )

        # 2. Extract Live Data
        live_info = adapter_result.live_info
        live_dict: Dict[str, Any] = {}
        avail_dict: Dict[str, str] = {}
        
        status_label = "VALID"
        if adapter_result.status_code == 429 or adapter_result.error_code in ("CREDITS_EXHAUSTED", "RATE_LIMIT_EXCEEDED", "RESOURCE_EXHAUSTED"):
            status_label = "EXHAUSTED"

        tier_detected = live_info.tier_detected if live_info else None

        if live_info:
            if live_info.tokens_remaining is not None or live_info.tokens_limit is not None:
                live_dict["tokens"] = {
                    "remaining": live_info.tokens_remaining,
                    "limit": live_info.tokens_limit,
                    "reset": live_info.reset_duration,
                    "source": "LIVE (Provider Headers)"
                }
                avail_dict["tokens"] = "live"
            else:
                avail_dict["tokens"] = "not_available"

            if live_info.requests_remaining is not None or live_info.requests_limit is not None:
                live_dict["requests"] = {
                    "remaining": live_info.requests_remaining,
                    "limit": live_info.requests_limit,
                    "reset": live_info.reset_duration,
                    "source": "LIVE (Provider Headers)"
                }
                avail_dict["requests"] = "live"
            else:
                avail_dict["requests"] = "not_available"

            if live_info.credits_remaining is not None or live_info.credits_total is not None:
                live_dict["credits"] = {
                    "remaining": live_info.credits_remaining,
                    "total": live_info.credits_total,
                    "reset": live_info.reset_duration,
                    "source": "LIVE (Provider API)"
                }
                avail_dict["credits"] = "live"
            else:
                avail_dict["credits"] = "not_available"

            if live_info.reset_duration:
                live_dict["reset_time"] = live_info.reset_duration

        # 3. Format Published Catalog Data
        published_list: List[PublishedMetric] = []
        for pub in published_limits:
            published_list.append(PublishedMetric(
                limit_value=pub.limit_value,
                unit=pub.unit,
                window=pub.window,
                tier=pub.tier,
                source_type=pub.source_type,
                source_url=pub.source_url,
                verified_at=pub.last_verified_at,
                notes=pub.notes
            ))

        # 4. Safe mathematical calculation for the Limit Progress Bar
        from app.services.key_monitor.usage_tracker import usage_tracker
        tracked = usage_tracker.get_usage(provider)
        tracked_tokens = tracked.get("tokens", 0)
        tracked_reqs = tracked.get("requests", 0)
        tracked_credits = tracked.get("credits_estimated", 0.0)

        calc = CalculatedUsage()

        if live_info and live_info.tokens_limit is not None and live_info.tokens_limit > 0:
            header_used = max(0, live_info.tokens_limit - (live_info.tokens_remaining or live_info.tokens_limit))
            used = max(header_used, tracked_tokens)
            remaining = max(0, live_info.tokens_limit - used)
            pct = round((used / live_info.tokens_limit) * 100, 1)
            calc = CalculatedUsage(
                percentage_used=pct,
                used_amount=float(used),
                remaining_amount=float(remaining),
                total_amount=float(live_info.tokens_limit),
                unit="tokens",
                is_estimated=False,
                display_label=f"{used:,.0f} used / {live_info.tokens_limit:,.0f} tokens ({remaining:,.0f} left · {pct}%)"
            )
        elif live_info and live_info.credits_total is not None and live_info.credits_total > 0:
            header_used = max(0.0, live_info.credits_total - (live_info.credits_remaining or live_info.credits_total))
            used = max(header_used, tracked_credits)
            remaining = max(0.0, round(live_info.credits_total - used, 1))
            pct = round((used / live_info.credits_total) * 100, 1)
            calc = CalculatedUsage(
                percentage_used=pct,
                used_amount=used,
                remaining_amount=remaining,
                total_amount=live_info.credits_total,
                unit="credits",
                is_estimated=False,
                display_label=f"{used:,.1f} used / {live_info.credits_total:,.0f} credits ({remaining:,.1f} left · {pct}%)"
            )
        elif live_info and live_info.requests_limit is not None and live_info.requests_limit > 0:
            header_used = max(0, live_info.requests_limit - (live_info.requests_remaining or live_info.requests_limit))
            used = max(header_used, tracked_reqs)
            remaining = max(0, live_info.requests_limit - used)
            pct = round((used / live_info.requests_limit) * 100, 1)
            calc = CalculatedUsage(
                percentage_used=pct,
                used_amount=float(used),
                remaining_amount=float(remaining),
                total_amount=float(live_info.requests_limit),
                unit="requests",
                is_estimated=False,
                display_label=f"{used:,.0f} used / {live_info.requests_limit:,.0f} reqs ({pct}%)"
            )
        elif live_info and live_info.tokens_remaining is not None:
            # Match with published limit if known
            pub_token_entry = next((p for p in published_limits if p.unit == "tokens"), None)
            if pub_token_entry and pub_token_entry.limit_value > 0:
                used = max(0.0, pub_token_entry.limit_value - live_info.tokens_remaining)
                pct = round((used / pub_token_entry.limit_value) * 100, 1)
                calc = CalculatedUsage(
                    percentage_used=pct,
                    used_amount=used,
                    remaining_amount=float(live_info.tokens_remaining),
                    total_amount=pub_token_entry.limit_value,
                    unit="tokens",
                    is_estimated=True,
                    display_label=f"{live_info.tokens_remaining:,.0f} tokens remaining (Published: {pub_token_entry.limit_value:,.0f}/{pub_token_entry.window})"
                )
            else:
                calc = CalculatedUsage(
                    remaining_amount=float(live_info.tokens_remaining),
                    unit="tokens",
                    display_label=f"{live_info.tokens_remaining:,.0f} tokens remaining"
                )
        elif tracked_tokens > 0 or tracked_reqs > 0:
            calc = CalculatedUsage(
                used_amount=float(tracked_tokens),
                unit="tokens",
                is_estimated=False,
                display_label=f"Active Session: {tracked_tokens:,.0f} tokens processed · {tracked_reqs} requests (Live account balance not broadcasted by provider API)"
            )
        elif published_limits:
            first_pub = published_limits[0]
            calc = CalculatedUsage(
                unit=first_pub.unit,
                display_label=f"Active Key · Live balance not broadcasted by provider (Published: {first_pub.limit_value:,.0f} {first_pub.unit}/{first_pub.window})"
            )
        else:
            calc = CalculatedUsage(
                display_label="Active API Key · Live account balance not broadcasted by provider API"
            )

        return UnifiedQuotaResponse(
            provider=provider,
            fingerprint=fingerprint,
            valid=True,
            status=status_label,
            tier=tier_detected or (published_limits[0].tier if published_limits else "Standard"),
            live=live_dict,
            published=published_list,
            calculated=calc,
            availability=avail_dict,
            cached=is_cached
        )
