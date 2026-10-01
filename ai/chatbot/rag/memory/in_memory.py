from typing import List, Dict
from collections import defaultdict
from ai.chatbot.rag.memory.base import BaseMemory
import logging
logger = logging.getLogger(__name__)


class InMemoryConversationMemory(BaseMemory):
    """
    Sliding-window session conversation memory store.
    """

    def __init__(self, max_messages: int = 10):
        self.max_messages = max_messages
        self._store: Dict[str, List[Dict[str, str]]] = defaultdict(list)

    def add_user_message(self, conversation_id: str, message: str):
        if not conversation_id:
            return
        self._store[conversation_id].append({"role": "user", "content": message})
        self._trim(conversation_id)

    def add_ai_message(self, conversation_id: str, message: str):
        if not conversation_id:
            return
        self._store[conversation_id].append({"role": "assistant", "content": message})
        self._trim(conversation_id)

    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        return self._store.get(conversation_id, [])

    def clear_history(self, conversation_id: str):
        if conversation_id in self._store:
            del self._store[conversation_id]
            logger.info(f"Cleared memory history for conversation ID: {conversation_id}")

    def _trim(self, conversation_id: str):
        if len(self._store[conversation_id]) > self.max_messages:
            self._store[conversation_id] = self._store[conversation_id][-self.max_messages:]
