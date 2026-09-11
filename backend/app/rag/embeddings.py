import hashlib
import numpy as np
from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings
from app.core.logging import logger


import re

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic mock embedding provider for testing & offline development.
    Generates unit-normalized pseudo-random vectors based on string hash.
    """
    def __init__(self, dimension: int = settings.EMBEDDING_DIMENSION):
        self.dimension = dimension

    def _generate_vector(self, text: str) -> List[float]:
        # Tokenize words using regex to provide realistic semantic term similarity in mock mode
        words = re.findall(r"\w+", text.lower())
        if not words:
            words = ["empty"]

        vec = np.zeros(self.dimension)
        for word in words:
            hash_digest = hashlib.sha256(word.encode("utf-8")).digest()
            seed = int.from_bytes(hash_digest[:4], "big")
            rng = np.random.RandomState(seed)
            vec += rng.randn(self.dimension)

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_text(self, text: str) -> List[float]:
        return self._generate_vector(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str = settings.EMBEDDING_API_KEY, model: str = settings.EMBEDDING_MODEL):
        if not api_key:
            logger.warning("OpenAI API key not set for Embedding provider; falling back to Mock provider")
            self._fallback = MockEmbeddingProvider()
            self.use_fallback = True
        else:
            self.use_fallback = False
            from openai import OpenAI
            self.client = OpenAI(api_key=api_key)
            self.model = model

    def embed_text(self, text: str) -> List[float]:
        if self.use_fallback:
            return self._fallback.embed_text(text)
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.model,
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding error: {e}")
            raise

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        if self.use_fallback:
            return self._fallback.embed_documents(texts)
        try:
            response = self.client.embeddings.create(
                input=texts,
                model=self.model,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"OpenAI batch embedding error: {e}")
            raise


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "openai":
        return OpenAIEmbeddingProvider()
    elif provider == "mock":
        return MockEmbeddingProvider()
    else:
        logger.warning(f"Unknown EMBEDDING_PROVIDER '{provider}'. Defaulting to Mock.")
        return MockEmbeddingProvider()
