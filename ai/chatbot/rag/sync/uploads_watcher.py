import threading
import time
from pathlib import Path
from typing import Optional

from ai.chatbot.rag.rag.rag_service import RAGService
from ai.chatbot.rag.constants import SUPPORTED_EXTENSIONS
import logging
logger = logging.getLogger(__name__)


class UploadsWatcher:
    """
    Polls the uploads directory on a fixed interval and detects files that
    were removed directly from disk (e.g. deleted manually, not through the
    API). Whenever a previously-seen file disappears, its vectors/chunks are
    purged from the vector store so the RAG index never answers from stale,
    deleted documents.

    Polling (rather than OS-level file events) is used deliberately: it
    works reliably across Docker volumes / network mounts / WSL where
    inotify-style events are often missed, at the small cost of a short
    detection delay (poll_interval_seconds).
    """

    def __init__(self, rag_service: RAGService, uploads_dir: Path, poll_interval_seconds: float = 3.0):
        self.rag_service = rag_service
        self.uploads_dir = Path(uploads_dir)
        self.poll_interval_seconds = poll_interval_seconds
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._known_files: set[str] = set()

    def _snapshot(self) -> set[str]:
        if not self.uploads_dir.exists():
            return set()
        return {p.name for p in self.uploads_dir.glob("*") if p.is_file()}

    def _run(self) -> None:
        # Run one reconciliation immediately on startup, in case files were
        # deleted from the folder while the app wasn't running.
        try:
            self.rag_service.sync_with_uploads_dir(self.uploads_dir)
        except Exception as e:
            logger.error(f"UploadsWatcher: startup sync failed: {e}")

        self._known_files = self._snapshot()
        logger.info(f"UploadsWatcher started. Watching '{self.uploads_dir}' every {self.poll_interval_seconds}s.")

        while not self._stop_event.is_set():
            self._stop_event.wait(self.poll_interval_seconds)
            if self._stop_event.is_set():
                break

            try:
                current_files = self._snapshot()
                removed_files = self._known_files - current_files
                new_files = current_files - self._known_files

                for filename in removed_files:
                    try:
                        count = self.rag_service.vector_store.delete_by_source(filename)
                        logger.info(f"UploadsWatcher: '{filename}' was deleted from disk -> removed {count} vectors.")
                    except Exception as e:
                        logger.error(f"UploadsWatcher: failed to purge vectors for '{filename}': {e}")

                for filename in new_files:
                    file_path = self.uploads_dir / filename
                    if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                        continue
                    try:
                        result = self.rag_service.ingest_file(file_path)
                        logger.info(
                            f"UploadsWatcher: '{filename}' appeared in the folder -> "
                            f"indexed {result['vectors_indexed']} vectors."
                        )
                    except Exception as e:
                        logger.error(f"UploadsWatcher: failed to ingest new file '{filename}': {e}")

                self._known_files = current_files
            except Exception as e:
                logger.error(f"UploadsWatcher: polling cycle failed: {e}")

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="uploads-watcher", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=self.poll_interval_seconds + 2)
