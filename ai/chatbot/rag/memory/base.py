from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseMemory(ABC):
    """
    Abstract Base Class for Conversation Memory Management.
    """

    @abstractmethod
    def add_user_message(self, conversation_id: str, message: str):
        pass

    @abstractmethod
    def add_ai_message(self, conversation_id: str, message: str):
        pass

    @abstractmethod
    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        pass

    @abstractmethod
    def clear_history(self, conversation_id: str):
        pass
