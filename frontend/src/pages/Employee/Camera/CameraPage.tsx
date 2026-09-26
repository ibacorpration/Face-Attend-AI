import { useEffect, useState, useRef } from 'react';
import { useCamera } from '../../../hooks/useCamera';
import { recognitionService, RecognitionResult } from '../../../services/recognition.service';
import { ScanFace, AlertCircle, LogIn, LogOut, ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import SuccessScreen from './SuccessScreen';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const CameraPage = () => {
  const { videoRef, isStreamActive, error, startCamera, stopCamera, captureFrame } = useCamera();
  const [status, setStatus] = useState<string>('Select an action to begin');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'check_in' | 'check_out' | null>(null);
  const [hasError, setHasError] = useState(false);
  const controls = useAnimation();
  const navigate = useNavigate();

  const intervalRef = useRef<number | null>(null);

  // Start camera on mount regardless of action
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    // Only scan if an action is selected
    if (isStreamActive && !recognitionResult && selectedAction) {
      setStatus('Looking for a face...');

      intervalRef.current = window.setInterval(async () => {
        if (isProcessingRef.current) return;

        const blob = captureFrame();
        if (blob) {
          isProcessingRef.current = true;
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
            } else {
              if (result.error) {
                setStatus(result.error);
              } else if (result.status === 'unknown') {
                setStatus('Unregistered face');
              } else if (result.status === 'borderline') {
                setStatus('Confidence too low. Move closer.');
              }
              
              if (result.status === 'unknown' || (result.error && result.error !== 'No face detected')) {
                setHasError(true);
                controls.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } });
                setTimeout(() => setHasError(false), 2000);
              }
            }
          } catch (err: any) {
            console.error('Recognition error:', err);
            const detail = err.response?.data?.detail || err.message || 'Error connecting to AI service';
            setStatus(`Error: ${detail}`);
          } finally {
            // Delay before next scan to allow user to read the message
            setTimeout(() => {
              isProcessingRef.current = false;
              setIsProcessing(false);
            }, 700);
          }
        }
      }, 500); // Poll every 500ms
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreamActive, captureFrame, recognitionResult, selectedAction, stopCamera, controls]);

  const handleActionSelect = (action: 'check_in' | 'check_out') => {
    setSelectedAction(action);
    setStatus('Initializing AI...');
  };

  const handleBack = () => {
    if (selectedAction) {
      // Go back to action selection without stopping camera
      setSelectedAction(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('Select an action to begin');
      setLastScore(null);
    } else {
      stopCamera();
      navigate('/');
    }
  };

  if (recognitionResult) {
    return <SuccessScreen result={recognitionResult} onContinue={() => navigate('/')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#0d0d0f] relative flex flex-col items-center justify-center overflow-hidden font-sans"
    >

      {/* Background Video ALWAYS visible */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
        muted
      />

      {/* Top Bar Overlay */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <button
          onClick={handleBack}
          className="bg-sidebar/80 backdrop-blur-md border border-white/10 rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-primary transition-colors shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="bg-sidebar/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-lg">
          <Camera className="text-primary" size={20} />
          <span className="text-white text-sm font-bold tracking-wide">
            {!selectedAction
              ? 'Camera Ready'
              : isProcessing ? 'AI Analyzing...' : `Scanning for ${selectedAction === 'check_in' ? 'Check In' : 'Check Out'}`}
          </span>
        </div>

        {lastScore !== null && selectedAction && (
          <div className="bg-sidebar/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-white text-sm font-bold tracking-wide">{lastScore}% Match</span>
          </div>
        )}
      </div>

      {/* Centered Scanning UI */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Frame Brackets (Only show when scanning) */}
        {selectedAction && (
          <motion.div animate={controls} className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${hasError ? 'border-red-500' : 'border-primary'} rounded-tl-2xl transition-colors duration-300`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${hasError ? 'border-red-500' : 'border-primary'} rounded-tr-2xl transition-colors duration-300`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${hasError ? 'border-red-500' : 'border-primary'} rounded-bl-2xl transition-colors duration-300`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${hasError ? 'border-red-500' : 'border-primary'} rounded-br-2xl transition-colors duration-300`} />

            {isProcessing && (
              <motion.div
                className="absolute left-0 right-0 h-1 bg-primary/70 shadow-[0_0_20px_rgba(198,241,53,0.8)]"
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        )}

        {/* Bottom Black Box */}
        {selectedAction ? (
          <div className="bg-sidebar/80 backdrop-blur-md border border-white/10 rounded-[24px] p-8 text-center w-80 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <ScanFace className="text-primary" size={32} />
              </div>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              {isProcessing ? 'Recognizing...' : 'Align your face'}
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              {status}
            </p>
          </div>
        ) : (
          <div className="bg-sidebar/80 backdrop-blur-md border border-white/10 rounded-[32px] p-8 text-center w-80 shadow-2xl mt-40">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ScanFace className="text-primary" size={32} />
            </div>
            <h3 className="text-white font-bold text-xl mb-6">Select Action</h3>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleActionSelect('check_in')}
                className="w-full h-12 bg-primary text-sidebar font-bold text-base hover:bg-primary-light"
              >
                <LogIn className="mr-2" size={18} />
                Check In
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleActionSelect('check_out')}
                className="w-full h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-base"
              >
                <LogOut className="mr-2 text-primary" size={18} />
                Check Out
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg z-50"
          >
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CameraPage;
