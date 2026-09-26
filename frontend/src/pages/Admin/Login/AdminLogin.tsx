import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowLeft, Camera, X } from 'lucide-react';
import ibaMascotFull from '../../../assets/iba-mascot-full.png';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCamera } from '../../../hooks/useCamera';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Face Login states
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const [faceStatus, setFaceStatus] = useState('Position your face in the frame');
  const { videoRef, isStreamActive, error, startCamera, stopCamera, captureFrame } = useCamera();
  const intervalRef = useRef<number | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const controls = useAnimation();
  const cameraControls = useAnimation();
  const [hasCameraError, setHasCameraError] = useState(false);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showCamera, startCamera, stopCamera]);

  useEffect(() => {
    if (showCamera && isStreamActive && !isProcessingFace) {
      setFaceStatus('Looking for a face...');
      intervalRef.current = window.setInterval(async () => {
        if (isProcessingFace) return;

        const blob = captureFrame();
        if (blob) {
          setIsProcessingFace(true);
          setFaceStatus('AI Analyzing...');
          try {
            const response = await authService.faceLogin(blob);
            login(response.access_token);
            toast.success('Face recognized! Logged in.');
            if (intervalRef.current) clearInterval(intervalRef.current);
            stopCamera();
            navigate(from, { replace: true });
          } catch (err: any) {
            const detail = err.response?.data?.detail || 'Face not recognized';
            setFaceStatus(detail);
            setIsProcessingFace(false);
            if (detail !== 'No face detected' && !detail.includes('No admin faces registered')) {
              setHasCameraError(true);
              cameraControls.start({ x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } });
              setTimeout(() => setHasCameraError(false), 2000);
            }
          }
        }
      }, 600);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showCamera, isStreamActive, isProcessingFace, captureFrame, login, navigate, from, stopCamera]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(username, password);
      login(response.access_token);
      toast.success('Successfully logged in');
      navigate(from, { replace: true });
    } catch (err: any) {
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      toast.error(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/')}
          className="bg-[#20152F]/80 backdrop-blur-md border border-[#5B2A72]/30 rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-primary transition-colors shadow-lg"
          title="Back to Landing Page"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5B2A72]/10 blur-[100px]" />

      <motion.div
        animate={controls}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#20152F] rounded-[32px] p-10 shadow-[0_30px_60px_rgba(32,21,47,0.15)] border border-[#5B2A72]/50 relative"
        >
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm overflow-hidden cursor-pointer hover:scale-110 hover:shadow-lg transition-transform duration-300 relative group"
              onClick={() => setShowCamera(true)}
              title="Click to login with Face ID"
            >
              <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center backdrop-blur-[1px]">
                <Camera size={24} className="text-[#20152F]" />
              </div>
              <img src={ibaMascotFull} alt="IBA Mascot" className="w-full h-full object-contain p-2 group-hover:opacity-30 transition-opacity" />
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-center text-sm">Enter your credentials or click the logo for Face ID.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 pl-1">Username</label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User size={18} />}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 pl-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={18} />}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`relative flex items-center justify-center w-5 h-5 border rounded transition-colors ${rememberMe ? 'bg-primary border-primary' : 'bg-white/5 border-white/20 group-hover:border-primary'}`}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="opacity-0 absolute w-full h-full cursor-pointer" />
                  {rememberMe && (
                    <svg className="w-3 h-3 text-sidebar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">Forgot Password?</a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold bg-primary text-[#20152F] hover:bg-primary-light rounded-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#20152F]/20 border-t-[#20152F] rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
              onClick={() => setShowCamera(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#20152F] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-[#5B2A72]/50"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera size={20} className="text-primary" /> Face ID Login
                </h2>
                <button
                  onClick={() => setShowCamera(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center">
                <motion.div animate={cameraControls} className={`relative w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden border-4 ${hasCameraError ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-primary shadow-[0_0_30px_rgba(198,241,53,0.3)]'} bg-black/50 flex items-center justify-center transition-colors duration-300`}>
                  {error ? (
                    <div className="text-error text-center p-4">
                      <p className="text-sm">{error}</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                  {/* Scanning HUD effect */}
                  {isStreamActive && !error && (
                    <div className={`absolute inset-0 border-2 ${hasCameraError ? 'border-red-500/50' : 'border-primary/50'} rounded-full animate-[pulse_2s_ease-in-out_infinite] transition-colors`} />
                  )}
                </motion.div>

                <div className="text-center">
                  <p className="text-lg font-bold text-white mb-2">{faceStatus}</p>
                  <p className="text-sm text-slate-400">
                    {isProcessingFace ? 'Please hold still...' : 'Look directly at the camera'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLogin;
