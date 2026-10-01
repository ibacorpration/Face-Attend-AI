import pytest
from ai.chatbot.rag.rag.chat_service import RAGChatService
from ai.chatbot.rag.schemas.chat import ChatMessage

@pytest.fixture
def chat_service():
    # We initialize the RAGChatService. Note that in a CI environment without keys,
    # it might fallback to MockLLM or raise if configured strictly, 
    # but for structure tests it's generally fine.
    return RAGChatService(rag_service=None)

def test_chat_service_initialization(chat_service):
    assert chat_service is not None
    # We passed None for rag_service to test basic initialization


def test_chat_history_formatting(chat_service):
    # ChatMessage role is just a string
    messages = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there"},
        {"role": "user", "content": "How are you?"}
    ]
    formatted = chat_service._format_history(messages)
    
    assert "User: Hello" in formatted
    assert "Assistant: Hi there" in formatted
    assert "User: How are you?" in formatted
