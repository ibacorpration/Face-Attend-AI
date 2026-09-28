from abc import ABC, abstractmethod
from pathlib import Path
from ai.rag.documents.document import Document


class BaseLoader(ABC):
    """
    Abstract Base Class for Document Loaders.
    """

    @abstractmethod
    def load(self, file_path: Path) -> Document:
        """
        Parses a file from the given path into a Document object.
        """
        pass
