import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreamActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => Blob | null;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreamActive(true);
        };
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please ensure you have granted permission.');
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
  }, []);

  const captureFrame = useCallback((): Blob | null => {
    if (!videoRef.current || !isStreamActive) return null;

    const canvas = document.createElement('canvas');
    // Scale down image by 50% to dramatically speed up upload and AI processing
    // without affecting the UI video quality
    const scale = 0.6;
    canvas.width = videoRef.current.videoWidth * scale;
    canvas.height = videoRef.current.videoHeight * scale;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // We need to return a Promise that resolves with the Blob
      // But for synchronous use in interval, returning Data URL might be easier, 
      // however, to send to backend, Blob is better. 
      // Let's implement a synchronous toBlob alternative or return null and do it async.
      // We will do it synchronously by extracting DataURL, then converting.
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

      // Convert DataURL to Blob
      const arr = dataUrl.split(',');
      if (arr.length < 2) return null;

      const match = arr[0].match(/:(.*?);/);
      const mime = match ? match[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    return null;
  }, [isStreamActive]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreamActive,
    error,
    startCamera,
    stopCamera,
    captureFrame
  };
};
