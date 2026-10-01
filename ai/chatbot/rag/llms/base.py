from abc import ABC, abstractmethod
from typing import List, Dict, Any, Generator


class BaseLLMProvider(ABC):
    """
    Abstract Base Class for Large Language Model (LLM) Providers.
    """

    @abstractmethod
    def generate(self, prompt: str, system_prompt: str = None, **kwargs) -> str:
        """
        Generates a complete text response given a prompt.
        """
        pass

    @abstractmethod
    def generate_stream(self, prompt: str, system_prompt: str = None, **kwargs) -> Generator[str, None, None]:
        """
        Streams generated text tokens word-by-word.
        """
        pass
