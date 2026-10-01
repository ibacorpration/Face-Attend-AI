"""
Application constants and default values.
"""

# Supported Document File Extensions
SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".md", ".markdown", ".json", ".docx"}

# Vector DB Defaults
DEFAULT_COLLECTION_NAME = "rag_documents"
DEFAULT_SIMILARITY_TOP_K = 4

# Splitting Defaults
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200

# Log Formatting
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"