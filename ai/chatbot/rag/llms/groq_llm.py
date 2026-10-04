import os
import re
from typing import Generator
from groq import Groq
from ai.chatbot.rag.llms.base import BaseLLMProvider
from backend.core.config import settings
from ai.chatbot.rag.exceptions import RAGException, LLMRateLimitError
import logging
logger = logging.getLogger(__name__)


class GroqAPIKeyError(RAGException):
    """Raised when GROQ_API_KEY is missing or invalid."""
    pass

def _friendly_rate_limit_message(raw_error: str) -> str:
    """Convert Groq 429 errors into a user-friendly message."""
    return (
        "وصلنا للحد المسموح به من مزود الـ AI (Groq) مؤقتًا. "
        "جرب تاني بعد شوية.\n"
        "Daily rate limit reached on the AI provider (Groq). "
        "Please try again shortly."
    )

class GroqLLMProvider(BaseLLMProvider):
    """
    Groq LLM provider for the Tourism AI Assistant.
    """

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = (
            api_key
            if api_key is not None
            else getattr(settings, "GROQ_API_KEY", None)
            or os.getenv("GROQ_API_KEY")
        )

        self.model = model or getattr(
            settings,
            "GROQ_MODEL_NAME",
            "openai/gpt-oss-20b"    
        )

        # reasoning_effort is only accepted by Groq's reasoning models
        # (gpt-oss / qwen3 family). Sending it to a non-reasoning model
        # like llama-3.1-8b-instant can raise an API error, so we only
        # attach it when it's actually relevant.
        self._is_reasoning_model = (
            "gpt-oss" in self.model or "qwen3" in self.model
        )

        self.client = Groq(api_key=self.api_key) if self.api_key else None

    def _ensure_client(self):
        if not self.api_key or not self.client:
            raise GroqAPIKeyError(
                "GROQ_API_KEY is not set."
            )

    def generate(
        self,
        prompt: str,
        system_prompt: str = None,
        **kwargs
    ) -> str:

        self._ensure_client()

        try:
            messages = []

            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })

            messages.append({
                "role": "user",
                "content": prompt
            })

            logger.info(
                f"Sending prompt to Groq API "
                f"(model: {self.model})..."
            )

            create_kwargs = dict(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.5),
                max_tokens=kwargs.get(
                    "max_tokens",
                    settings.LLM_MAX_TOKENS
                ),
            )
            if self._is_reasoning_model:
                create_kwargs["reasoning_effort"] = kwargs.get(
                    "reasoning_effort", "low"
                )

            response = self.client.chat.completions.create(**create_kwargs)

            content = response.choices[0].message.content
            finish_reason = response.choices[0].finish_reason

            if not content:
                # Known Groq/gpt-oss behavior: the model can spend the
                # entire token budget on hidden reasoning and return no
                # visible answer (finish_reason == "length" in that case).
                # Surface a clear message instead of a silent empty bubble.
                logger.warning(
                    f"Groq returned empty content "
                    f"(model: {self.model}, finish_reason: {finish_reason})."
                )
                return (
                    "معلش، حصلت مشكلة في توليد الرد (الموديل رجع إجابة فاضية). "
                    "جرب تسأل تاني أو بصياغة أبسط.\n"
                    "Sorry, something went wrong generating a response "
                    "(the model returned an empty answer). Please try again."
                )

            return content

        except Exception as e:
            error_str = str(e)

            if "rate_limit_exceeded" in error_str or "429" in error_str:
                logger.error(
                    f"Groq rate limit hit: {error_str}"
                )
                raise LLMRateLimitError(
                    _friendly_rate_limit_message(error_str)
                )

            logger.error(
                f"Groq API call failed: {error_str}"
            )

            raise RAGException(
                f"Groq API error: {error_str}"
            )

    def generate_stream(
        self,
        prompt: str,
        system_prompt: str = None,
        **kwargs
    ) -> Generator[str, None, None]:

        self._ensure_client()

        try:
            messages = []

            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })

            messages.append({
                "role": "user",
                "content": prompt
            })

            logger.info(
                f"Starting Groq API stream "
                f"(model: {self.model})..."
            )

            stream_kwargs = dict(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.5),
                max_tokens=kwargs.get(
                    "max_tokens",
                    settings.LLM_MAX_TOKENS
                ),
                stream=True,
            )
            if self._is_reasoning_model:
                stream_kwargs["reasoning_effort"] = kwargs.get(
                    "reasoning_effort", "low"
                )

            stream = self.client.chat.completions.create(**stream_kwargs)

            for chunk in stream:

                if not chunk.choices:
                    continue

                content = chunk.choices[0].delta.content

                if content:
                    yield content

        except Exception as e:
            error_str = str(e)

            if "rate_limit_exceeded" in error_str or "429" in error_str:
                logger.error(
                    f"Groq rate limit hit (stream): {error_str}"
                )
                raise LLMRateLimitError(
                    _friendly_rate_limit_message(error_str)
                )

            logger.error(
                f"Groq API streaming failed: {error_str}"
            )

            raise RAGException(
                f"Groq API streaming error: {error_str}"
            )
