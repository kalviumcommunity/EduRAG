from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from app.core.config import settings
from app.core.logging import logger
from app.rag.prompt_builder import PromptBuilder


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_answer(
        self,
        question: str,
        formatted_context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Mock LLM provider for testing and zero-cost local development.
    """
    def generate_answer(
        self,
        question: str,
        formatted_context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        if "No relevant course material found." in formatted_context or not formatted_context.strip():
            return "I couldn't find sufficient information about this question in the provided course material."

        return (
            f"Based on the provided course material:\n\n"
            f"In response to '{question}', the material explains that key concepts and principles apply as described in the documents. "
            f"Please refer to the attached source citations for detailed page references."
        )


class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str = settings.LLM_API_KEY, model: str = settings.LLM_MODEL):
        if not api_key:
            logger.warning("OpenAI API key not configured for LLM; falling back to MockLLMProvider")
            self._fallback = MockLLMProvider()
            self.use_fallback = True
        else:
            self.use_fallback = False
            from openai import OpenAI
            self.client = OpenAI(api_key=api_key)
            self.model = model

    def generate_answer(
        self,
        question: str,
        formatted_context: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        if self.use_fallback:
            return self._fallback.generate_answer(question, formatted_context, conversation_history)

        system_prompt = PromptBuilder.build_system_prompt()
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for msg in conversation_history[-4:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
                
        user_content = f"--- PROVIDED COURSE MATERIAL ---\n{formatted_context}\n\n--- QUESTION ---\n{question}"
        messages.append({"role": "user", "content": user_content})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,  # Low temperature for strict grounding
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI LLM completion error: {e}")
            raise


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai":
        return OpenAILLMProvider()
    elif provider == "mock":
        return MockLLMProvider()
    else:
        logger.warning(f"Unknown LLM_PROVIDER '{provider}'. Defaulting to Mock.")
        return MockLLMProvider()
