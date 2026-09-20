import os
import urllib.request
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODELS = {
    "face_detection_yunet.onnx": "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
    "w600k_r50.onnx": "https://huggingface.co/Aitrepreneur/insightface/resolve/main/models/buffalo_l/w600k_r50.onnx"
}

def download_models(output_dir="ai/models"):
    os.makedirs(output_dir, exist_ok=True)
    
    for filename, url in MODELS.items():
        filepath = os.path.join(output_dir, filename)
        if os.path.exists(filepath):
            logger.info(f"{filename} already exists at {filepath}. Skipping download.")
            continue
            
        logger.info(f"Downloading {filename} from {url}...")
        try:
            urllib.request.urlretrieve(url, filepath)
            logger.info(f"Successfully downloaded {filename}")
        except Exception as e:
            logger.error(f"Failed to download {filename}: {e}")
            import sys
            sys.exit(1)

if __name__ == "__main__":
    download_models()
