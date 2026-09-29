import os
import logging
from typing import Generator
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from ai.rag.llms.base import BaseLLMProvider
from ai.rag.exceptions import RAGException, LLMRateLimitError
from backend.core.config import settings

logger = logging.getLogger(__name__)

class GeminiAPIKeyError(RAGException):
    """Raised when GEMINI_API_KEY is missing or invalid."""
    pass

class GeminiLLMProvider(BaseLLMProvider):
    """
    Gemini 2.5 Flash LLM provider.
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
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None

    def _ensure_configured(self):
        if not self.api_key or not self.model:
            raise GeminiAPIKeyError("GEMINI_API_KEY is not set.")

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        self._ensure_configured()
        try:
            logger.info(f"Sending prompt to Gemini API (model: {self.model_name})...")
            
            model = self.model
            if system_prompt:
                model = genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_prompt
                )
                
            generation_config = genai.types.GenerationConfig(
                temperature=kwargs.get("temperature", 0.5),
                max_output_tokens=kwargs.get("max_tokens", getattr(settings, "LLM_MAX_TOKENS", 500)),
            )

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )

            if response.prompt_feedback and getattr(response.prompt_feedback, "block_reason", None):
                 raise RAGException(f"Gemini API blocked the prompt: {response.prompt_feedback.block_reason}")

            if not response.text:
                raise RAGException("Gemini returned an empty response.")

            return response.text

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                logger.error(f"Gemini rate limit hit: {error_str}")
                raise LLMRateLimitError(f"Gemini rate limit exceeded: {error_str}")
            
            logger.error(f"Gemini API call failed: {error_str}")
            raise RAGException(f"Gemini API error: {error_str}")

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        self._ensure_configured()
        try:
            logger.info(f"Starting Gemini API stream (model: {self.model_name})...")
            
            model = self.model
            if system_prompt:
                model = genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_prompt
                )
                
            generation_config = genai.types.GenerationConfig(
                temperature=kwargs.get("temperature", 0.5),
                max_output_tokens=kwargs.get("max_tokens", getattr(settings, "LLM_MAX_TOKENS", 500)),
            )

            response = model.generate_content(
                prompt,
                stream=True,
                generation_config=generation_config,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                logger.error(f"Gemini rate limit hit (stream): {error_str}")
                raise LLMRateLimitError(f"Gemini rate limit exceeded: {error_str}")
            
            logger.error(f"Gemini API streaming failed: {error_str}")
            raise RAGException(f"Gemini API streaming error: {error_str}")
