from typing import Dict, Type
from app.services.key_monitor.adapters.base import BaseProviderAdapter
from app.services.key_monitor.adapters.groq_adapter import GroqAdapter
from app.services.key_monitor.adapters.nvidia_adapter import NvidiaAdapter
from app.services.key_monitor.adapters.openai_adapter import OpenAIAdapter
from app.services.key_monitor.adapters.gemini_adapter import GeminiAdapter
from app.services.key_monitor.adapters.openrouter_adapter import OpenRouterAdapter

ADAPTER_REGISTRY: Dict[str, Type[BaseProviderAdapter]] = {
    "groq": GroqAdapter,
    "nvidia": NvidiaAdapter,
    "openai": OpenAIAdapter,
    "gemini": GeminiAdapter,
    "openrouter": OpenRouterAdapter,
}

def get_adapter(provider: str) -> BaseProviderAdapter:
    clean = provider.strip().lower()
    adapter_cls = ADAPTER_REGISTRY.get(clean)
    if not adapter_cls:
        raise ValueError(f"Unsupported provider: '{provider}'. Supported: {list(ADAPTER_REGISTRY.keys())}")
    return adapter_cls()
