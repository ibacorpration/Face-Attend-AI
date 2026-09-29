import logging
from typing import Generator
from ai.rag.llms.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class FallbackLLMProvider(BaseLLMProvider):
    """
    LLM Provider that attempts to use a primary provider and falls back 
    to a secondary provider if the primary fails.
    """

    def __init__(self, primary: BaseLLMProvider, fallback: BaseLLMProvider):
        self.primary = primary
        self.fallback = fallback

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        try:
            logger.info("LLM provider: Gemini")
            return self.primary.generate(prompt=prompt, system_prompt=system_prompt, **kwargs)
        except Exception as e:
            logger.warning(f"Gemini failed -> falling back to Groq. Error: {e}")
            logger.info("LLM provider: Groq (fallback)")
            return self.fallback.generate(prompt=prompt, system_prompt=system_prompt, **kwargs)

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        # For streaming, we have to handle the exception before yielding.
        # But once we yield the first token, if it fails midway, fallback is complicated.
        # Typically, we just try to get the stream object.
        stream_generator = None
        try:
            logger.info("LLM provider: Gemini (stream)")
            stream_generator = self.primary.generate_stream(prompt=prompt, system_prompt=system_prompt, **kwargs)
            # Try fetching the first chunk to catch immediate connection/API errors
            first_chunk = next(stream_generator)
            yield first_chunk
        except StopIteration:
            # The stream was just empty immediately, which is fine or handled later.
            pass
        except Exception as e:
            logger.warning(f"Gemini failed -> falling back to Groq (stream). Error: {e}")
            logger.info("LLM provider: Groq (fallback stream)")
            stream_generator = self.fallback.generate_stream(prompt=prompt, system_prompt=system_prompt, **kwargs)

        if stream_generator:
            try:
                for chunk in stream_generator:
                    yield chunk
            except Exception as e:
                # If the stream fails midway, we can't cleanly fallback since partial response is sent.
                # So we just raise or log error.
                logger.error(f"Stream failed during generation: {e}")
                raise
