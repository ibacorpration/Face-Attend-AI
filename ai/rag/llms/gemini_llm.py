import os
import logging
from typing import Generator
from google import genai
from google.genai import types
from google.genai.errors import APIError
from ai.rag.llms.base import BaseLLMProvider
from ai.rag.exceptions import RAGException, LLMRateLimitError
from backend.core.config import settings

logger = logging.getLogger(__name__)

class GeminiAPIKeyError(RAGException):
    """Raised when GEMINI_API_KEY is missing or invalid."""
    pass

class GeminiLLMProvider(BaseLLMProvider):
    """
    Gemini 2.5 Flash LLM provider using the modern google-genai SDK.
    """

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = (
            api_key
            if api_key is not None
            else getattr(settings, "GEMINI_API_KEY", None)
            or os.getenv("GEMINI_API_KEY")
        )

        self.model_name = (
            model 
            if model is not None 
            else getattr(settings, "GEMINI_MODEL", None)
            or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        )

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def _ensure_configured(self):
        if not self.api_key or not self.client:
            raise GeminiAPIKeyError("GEMINI_API_KEY is not set.")

    def _build_config(self, system_prompt: str = None, **kwargs) -> types.GenerateContentConfig:
        config_kwargs = {
            "temperature": kwargs.get("temperature", 0.5),
            "max_output_tokens": kwargs.get("max_tokens", getattr(settings, "LLM_MAX_TOKENS", 500)),
        }
        if system_prompt:
            config_kwargs["system_instruction"] = system_prompt
            
        # Using default safety settings as requested.
        return types.GenerateContentConfig(**config_kwargs)

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        self._ensure_configured()
        try:
            logger.info(f"Sending prompt to Gemini API (model: {self.model_name})...")
            
            config = self._build_config(system_prompt, **kwargs)

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            # Check if there is valid text content
            if not response.text or not response.text.strip():
                raise RAGException("Gemini returned an empty or whitespace-only response.")

            return response.text

        except APIError as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                logger.error(f"Gemini rate limit hit: {e}")
                raise LLMRateLimitError(f"Gemini rate limit exceeded: {e}")
            
            logger.error(f"Gemini API call failed: {e}")
            raise RAGException(f"Gemini API error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during Gemini generate: {e}")
            raise RAGException(f"Gemini unexpected error: {e}")

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        self._ensure_configured()
        try:
            logger.info(f"Starting Gemini API stream (model: {self.model_name})...")
            
            config = self._build_config(system_prompt, **kwargs)

            response_stream = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text

        except APIError as e:
            error_str = str(e).lower()
            if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                logger.error(f"Gemini rate limit hit (stream): {e}")
                raise LLMRateLimitError(f"Gemini rate limit exceeded (stream): {e}")
            
            logger.error(f"Gemini API streaming failed: {e}")
            raise RAGException(f"Gemini API streaming error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during Gemini stream: {e}")
            raise RAGException(f"Gemini unexpected error (stream): {e}")
