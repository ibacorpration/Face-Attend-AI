import logging
from typing import Generator
from ai.chatbot.rag.llms.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class FallbackLLMProvider(BaseLLMProvider):
    """
    LLM Provider that attempts to use a primary provider (Gemini) and falls back 
    to a secondary provider (Groq) if the primary fails.
    """

    def __init__(self, primary: BaseLLMProvider, fallback: BaseLLMProvider):
        self.primary = primary
        self.fallback = fallback

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        try:
            logger.info("LLM provider: Gemini")
            return self.primary.generate(prompt=prompt, system_prompt=system_prompt, **kwargs)
        except Exception as e:
            # Fallback to Groq for any failure (API error, empty response, block, rate limit)
            logger.warning(f"Gemini failed -> falling back to Groq. Error: {e}")
            logger.info("LLM provider: Groq (fallback)")
            return self.fallback.generate(prompt=prompt, system_prompt=system_prompt, **kwargs)

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        stream_generator = None
        first_chunk = None
        
        # Case A & B: Try to start the stream and fetch the first usable chunk.
        try:
            logger.info("LLM provider: Gemini (stream)")
            stream_generator = self.primary.generate_stream(prompt=prompt, system_prompt=system_prompt, **kwargs)
            first_chunk = next(stream_generator)
        except StopIteration:
            # Case B: Stream returned no chunks (empty response)
            logger.warning("Gemini stream returned empty -> falling back to Groq (stream).")
            logger.info("LLM provider: Groq (fallback stream)")
            stream_generator = self.fallback.generate_stream(prompt=prompt, system_prompt=system_prompt, **kwargs)
        except Exception as e:
            # Case A: Failed before producing the first usable chunk
            logger.warning(f"Gemini failed -> falling back to Groq (stream). Error: {e}")
            logger.info("LLM provider: Groq (fallback stream)")
            stream_generator = self.fallback.generate_stream(prompt=prompt, system_prompt=system_prompt, **kwargs)

        # If we successfully got a first chunk from Gemini
        if first_chunk is not None:
            try:
                yield first_chunk
                for chunk in stream_generator:
                    yield chunk
            except Exception as e:
                # Case C: Failed midway after chunks have already been sent to the client.
                # We CANNOT restart the stream with Groq because the client already received partial text.
                # Propagate the error and log it.
                logger.error(f"Gemini stream failed during generation after chunks were sent. Error: {e}")
                raise
        elif stream_generator:
            # We are using the Groq fallback stream
            try:
                for chunk in stream_generator:
                    yield chunk
            except Exception as e:
                logger.error(f"Groq stream failed during generation: {e}")
                raise
