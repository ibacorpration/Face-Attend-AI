import React, { useEffect, useState, useRef } from 'react';
import { useCamera } from '../../../hooks/useCamera';
import { recognitionService, RecognitionResult } from '../../../services/recognition.service';
import { ScanFace, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessScreen from './SuccessScreen';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const { videoRef, isStreamActive, error, startCamera, stopCamera, captureFrame } = useCamera();
  const [status, setStatus] = useState<string>('Initializing camera...');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const navigate = useNavigate();

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (isStreamActive && !isProcessing && !recognitionResult) {
      setStatus('Looking for a face...');
      
      intervalRef.current = window.setInterval(async () => {
        if (isProcessing) return;
        
        const blob = captureFrame();
        if (blob) {
          setIsProcessing(true);
          setStatus('AI Analyzing...');
          try {
            const result = await recognitionService.verifyFace(blob);
            if (result.similarity_score) {
                setLastScore(Math.round(result.similarity_score * 100));
            }

            if (result.success && result.status === 'match') {
              setStatus('Identity confirmed');
              if (intervalRef.current) clearInterval(intervalRef.current);
              stopCamera();
              setRecognitionResult(result);
            } else if (result.error) {
              setStatus(result.error); // E.g., "No face found", "Liveness failed"
            } else if (result.status === 'unknown') {
              setStatus('Face not recognized. Please try again.');
            } else if (result.status === 'borderline') {
                setStatus('Confidence too low. Move closer.');
            }
          } catch (err) {
            console.error('Recognition error:', err);
            setStatus('Error connecting to AI service');
          } finally {
            setIsProcessing(false);
          }
        }
      }, 1500); // Poll every 1.5s
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreamActive, captureFrame, isProcessing, recognitionResult]);

  if (recognitionResult) {
    return <SuccessScreen result={recognitionResult} onContinue={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-black relative flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Video */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        playsInline
        muted
      />

      {/* Top Bar Overlay */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
          <ScanFace className="text-teal-400" size={18} />
          <span className="text-white text-sm font-medium">{isProcessing ? 'AI Analyzing...' : 'Camera Active'}</span>
        </div>
        
        {lastScore !== null && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-white text-sm font-medium">{lastScore}%</span>
          </div>
        )}
      </div>

      {/* Centered Scanning UI */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Frame Brackets */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
          {/* Top Left */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
          {/* Top Right */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-xl" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-xl" />
          
          {/* Scanning Line Animation */}
          {isProcessing && (
            <motion.div 
              className="absolute left-0 right-0 h-1 bg-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        {/* Status Message */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl p-6 text-center w-80">
          <div className="flex justify-center mb-3">
            <ScanFace className="text-teal-400" size={32} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">
            {isProcessing ? 'Recognizing...' : 'Align your face'}
          </h3>
          <p className="text-slate-400 text-sm">
            {status}
          </p>
        </div>

      </div>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
          >
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CameraPage;
