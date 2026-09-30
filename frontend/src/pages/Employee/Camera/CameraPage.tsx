import { useEffect, useState, useRef, useCallback } from 'react';
import { useCamera } from '../../../hooks/useCamera';
import { recognitionService, RecognitionResult } from '../../../services/recognition.service';
import { ScanFace, AlertCircle, LogIn, LogOut, ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import SuccessScreen from './SuccessScreen';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { getKioskMessage, TERMINAL_CODES } from './kioskMessages';

const SCAN_DELAY_MS = 1500;
const IDLE_SCAN_DELAY_MS = 2500;

const CameraPage = () => {
  const { videoRef, isStreamActive, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera();
  const [status, setStatus] = useState<string>('Select an action to begin');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [showBusy, setShowBusy] = useState(false);
  
  const isProcessingRef = useRef(false);
  const [selectedAction, setSelectedAction] = useState<'check_in' | 'check_out' | null>(null);
  const [hasError, setHasError] = useState(false);
  const controls = useAnimation();
  const navigate = useNavigate();

  const timeoutRef = useRef<number | null>(null);
  const busyTimeoutRef = useRef<number | null>(null);

  const backoffDelayRef = useRef(1000);
  const consecutiveErrorsRef = useRef(0);
  const [showRetry, setShowRetry] = useState(false);
  const [isTerminal, setIsTerminal] = useState(false);

  // Mutable refs for the loop
  const captureFrameRef = useRef(captureFrame);
  const selectedActionRef = useRef(selectedAction);
  const lastStatusChangeRef = useRef(0);
  const currentStatusRef = useRef(status);

  useEffect(() => {
    captureFrameRef.current = captureFrame;
    selectedActionRef.current = selectedAction;
  }, [captureFrame, selectedAction]);

  const updateStatus = useCallback((newStatus: string, force: boolean = false) => {
    if (currentStatusRef.current === newStatus) return;
    
    const now = Date.now();
    if (!force && now - lastStatusChangeRef.current < 1000) {
      // Too soon to update status unless forced
      return;
    }
    
    currentStatusRef.current = newStatus;
    lastStatusChangeRef.current = now;
    setStatus(newStatus);
  }, []);

  // Start camera on mount regardless of action
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (busyTimeoutRef.current) window.clearTimeout(busyTimeoutRef.current);
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!isStreamActive || recognitionResult || !selectedAction || showRetry || isTerminal) {
      return;
    }

    let isMounted = true;

    const poll = async () => {
      if (!isMounted || isProcessingRef.current || showRetry || isTerminal) return;

      const blob = captureFrameRef.current();
      if (!blob) {
        timeoutRef.current = window.setTimeout(poll, SCAN_DELAY_MS);
        return;
      }

      isProcessingRef.current = true;
      
      busyTimeoutRef.current = window.setTimeout(() => {
        if (isMounted) setShowBusy(true);
      }, 700);
      
      let nextDelay = SCAN_DELAY_MS;

      try {
        const result = await recognitionService.verifyFace(blob, selectedActionRef.current!);
        
        consecutiveErrorsRef.current = 0;
        backoffDelayRef.current = 1000;

        if (result.success && result.status === 'match') {
          if (result.message) {
            updateStatus(result.message, true);
          } else {
            updateStatus('Identity confirmed', true);
          }
          stopCamera();
          if (isMounted) setRecognitionResult(result);
          nextDelay = 0; // stop polling
        } else {
          // Failure path (even if HTTP 200, it's a domain failure like NO_FACE)
          const code = result.error_code;
          const msg = getKioskMessage(code);
          
          if (code && TERMINAL_CODES.includes(code)) {
            updateStatus(msg, true);
            if (isMounted) setIsTerminal(true);
            nextDelay = 0;
          } else {
            updateStatus(msg);
            
            if (code === 'NO_FACE') {
              nextDelay = IDLE_SCAN_DELAY_MS;
            } else {
              if (isMounted && code !== 'NO_FACE') {
                setHasError(true);
                controls.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } });
                setTimeout(() => {
                  if (isMounted) setHasError(false);
                }, 2000);
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Recognition error:', err);
        
        let code: string;
        if (!err.response) {
          code = 'NETWORK_ERROR';
        } else if (err.response.data?.detail?.error_code) {
          code = err.response.data.detail.error_code;
        } else {
          code = 'SERVER_ERROR';
        }
        
        const is5xxOrNetwork = code === 'SERVER_ERROR' || code === 'NETWORK_ERROR';
        
        if (is5xxOrNetwork) {
          consecutiveErrorsRef.current += 1;
          if (consecutiveErrorsRef.current >= 5) {
             if (isMounted) setShowRetry(true);
             updateStatus(getKioskMessage('TOO_MANY_ERRORS'), true);
             nextDelay = 0;
          } else {
             updateStatus(getKioskMessage(code));
             nextDelay = backoffDelayRef.current;
             backoffDelayRef.current = Math.min(backoffDelayRef.current * 2, 5000);
          }
        } else {
          // 400 or 413 or 422 with a specific error code like INVALID_IMAGE
          const msg = getKioskMessage(code);
          updateStatus(msg);
          nextDelay = SCAN_DELAY_MS;
        }
      } finally {
        if (busyTimeoutRef.current) {
          window.clearTimeout(busyTimeoutRef.current);
        }
        
        const finishCleanup = () => {
          if (isMounted) {
            setShowBusy(false);
            isProcessingRef.current = false;
            if (nextDelay > 0 && !showRetry && !isTerminal) {
              timeoutRef.current = window.setTimeout(poll, 0); // already waited nextDelay
            }
          }
        };

        if (nextDelay > 0) {
          timeoutRef.current = window.setTimeout(finishCleanup, nextDelay);
        } else {
          finishCleanup();
        }
      }
    };

    // Start first poll
    timeoutRef.current = window.setTimeout(poll, 300);

    return () => {
      isMounted = false;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (busyTimeoutRef.current) window.clearTimeout(busyTimeoutRef.current);
    };
  }, [isStreamActive, recognitionResult, selectedAction, showRetry, isTerminal, stopCamera, controls, updateStatus]);

  const handleActionSelect = (action: 'check_in' | 'check_out') => {
    setSelectedAction(action);
    updateStatus('Align your face', true);
  };

  const handleBack = () => {
    if (selectedAction) {
      setSelectedAction(null);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (busyTimeoutRef.current) window.clearTimeout(busyTimeoutRef.current);
      setShowRetry(false);
      setIsTerminal(false);
      consecutiveErrorsRef.current = 0;
      backoffDelayRef.current = 1000;
      isProcessingRef.current = false;
      setShowBusy(false);
      updateStatus('Select an action to begin', true);
    } else {
      stopCamera();
      navigate('/');
    }
  };

  if (recognitionResult) {
    return <SuccessScreen result={recognitionResult} onContinue={() => navigate('/')} />;
  }

  const getDisplayedCameraError = () => {
    if (cameraError) {
      return getKioskMessage('CAMERA_DENIED');
    }
    return null;
  };

  const displayedCameraError = getDisplayedCameraError();

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
              : showBusy ? 'Scanning...' : 'Scanning for ' + (selectedAction === 'check_in' ? 'Check In' : 'Check Out')}
          </span>
        </div>
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

            {showBusy && (
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
              {showBusy ? 'Checking...' : 'Align your face'}
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-4">
              {status}
            </p>
            {showRetry && (
              <Button 
                onClick={() => { setShowRetry(false); consecutiveErrorsRef.current = 0; backoffDelayRef.current = 1000; updateStatus('Align your face', true); }} 
                className="w-full h-12 bg-primary text-sidebar font-bold text-base hover:bg-primary-light"
              >
                Retry
              </Button>
            )}
            {isTerminal && (
              <Button 
                onClick={handleBack} 
                className="w-full h-12 bg-primary text-sidebar hover:bg-primary-light font-bold text-base mt-2"
              >
                Back
              </Button>
            )}
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
        {displayedCameraError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-error text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg z-50"
          >
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{displayedCameraError}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CameraPage;
