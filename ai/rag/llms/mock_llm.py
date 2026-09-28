import time
from typing import Generator
from ai.rag.llms.base import BaseLLMProvider
import logging
logger = logging.getLogger(__name__)


class MockLLMProvider(BaseLLMProvider):
    """
    Offline / Fallback LLM Provider that synthesizes answers based on retrieved context.
    Ensures the RAG pipeline operates deterministically and offline without API keys.
    """

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        logger.info("Generating response with MockLLMProvider...")
        if "CONTEXT:" in prompt:
            context_part = prompt.split("CONTEXT:")[1].split("QUESTION:")[0].strip()
            question_part = prompt.split("QUESTION:")[-1].strip()
            response = (
                f"Based on the provided document context, here is the answer to your question ('{question_part}'):\n\n"
                f"{context_part[:400]}..."
            )
        else:
            response = f"This is an automated response to your query: '{prompt}'."
        return response

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        full_text = self.generate(prompt, system_prompt=system_prompt, **kwargs)
        words = full_text.split(" ")
        for word in words:
            yield word + " "
            time.sleep(0.03)
