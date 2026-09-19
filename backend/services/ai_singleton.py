from ai.services.face_recognition_service import FaceRecognitionService

_instance: FaceRecognitionService | None = None


def get_ai_service() -> FaceRecognitionService:
    """
    Returns a single shared FaceRecognitionService instance so the YuNet
    detector and ArcFace ONNX session are loaded from disk once (at first
    use), instead of being reloaded on every face registration/verification.
    """
    global _instance
    if _instance is None:
        _instance = FaceRecognitionService()
    return _instance