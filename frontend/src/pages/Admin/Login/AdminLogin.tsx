import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';
import { motion, useAnimation } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const controls = useAnimation();

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
      {/* Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sidebar/5 blur-[100px]" />

      <motion.div 
        animate={controls}
        className="w-full max-w-md relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-sidebar rounded-[32px] p-10 shadow-soft-lg border border-sidebar/50"
        >
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Shield className="text-sidebar" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-center text-sm">Enter your credentials to access Eduplex.</p>
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
              className="w-full h-12 text-base font-bold bg-primary text-sidebar hover:bg-primary-light rounded-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-sidebar/20 border-t-sidebar rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
