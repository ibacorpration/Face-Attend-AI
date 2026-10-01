from pathlib import Path
from ai.chatbot.rag.loaders.base import BaseLoader
from ai.chatbot.rag.loaders.text import TextLoader
from ai.chatbot.rag.loaders.pdf import PDFLoader
from ai.chatbot.rag.exceptions import UnsupportedFileTypeError


class LoaderFactory:
    """
    Factory for instantiating the appropriate document loader based on file extension.
    """

    @staticmethod
    def get_loader(file_path: Path) -> BaseLoader:
        suffix = Path(file_path).suffix.lower()

        if suffix in [".txt", ".md", ".markdown", ".json"]:
            return TextLoader()
        elif suffix == ".pdf":
            return PDFLoader()
        else:
            raise UnsupportedFileTypeError(f"Unsupported file extension '{suffix}' for file {file_path.name}")
