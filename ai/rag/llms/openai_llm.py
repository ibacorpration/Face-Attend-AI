import os
from typing import Generator
from ai.rag.llms.base import BaseLLMProvider
import logging
logger = logging.getLogger(__name__)


class OpenAILLMProvider(BaseLLMProvider):
    """
    OpenAI / vLLM / Ollama API Compatible LLM Provider.
    """

    def __init__(self, api_key: str = None, model: str = "gpt-3.5-turbo"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model

    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not set. Using offline fallback LLM.")
            from ai.rag.llms.mock_llm import MockLLMProvider
            return MockLLMProvider().generate(prompt, system_prompt=system_prompt, **kwargs)

        try:
            import openai
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            client = openai.OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.3)
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}. Falling back to MockLLMProvider.")
            from ai.rag.llms.mock_llm import MockLLMProvider
            return MockLLMProvider().generate(prompt, system_prompt=system_prompt, **kwargs)

    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        if not self.api_key:
            from ai.rag.llms.mock_llm import MockLLMProvider
            yield from MockLLMProvider().generate_stream(prompt, system_prompt=system_prompt, **kwargs)
            return

        try:
            import openai
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            client = openai.OpenAI(api_key=self.api_key)
            stream = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.3),
                stream=True
            )
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.error(f"OpenAI streaming API call failed: {e}")
            from ai.rag.llms.mock_llm import MockLLMProvider
            yield from MockLLMProvider().generate_stream(prompt, system_prompt=system_prompt, **kwargs)
