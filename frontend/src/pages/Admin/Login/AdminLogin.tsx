import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ScanFace, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(username, password);
      login(response.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex overflow-hidden w-full max-w-5xl h-[600px]">
        
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={18} />
            </div>
            <span className="font-bold text-slate-800 text-lg">FaceAttend AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Access</h1>
            <p className="text-slate-500">Sign in to your administrator account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={18} className="text-slate-400 hover:text-slate-600" /> : <Eye size={18} className="text-slate-400 hover:text-slate-600" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
             <a href="#" className="text-sm text-[var(--primary)] hover:underline font-medium">Forgot password?</a>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex w-1/2 bg-slate-50 flex-col items-center justify-center p-12 border-l border-slate-100 relative overflow-hidden">
           {/* Abstract shapes matching the light, blue/cyan theme */}
           <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
           <div className="absolute bottom-20 left-20 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-60"></div>
           
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="relative z-10 text-center flex flex-col items-center"
           >
              {/* Illustration placeholder replacing the specific image */}
              <div className="w-64 h-48 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative mb-8">
                 <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <Shield className="text-[var(--primary)]" size={24} />
                 </div>
                 <ScanFace className="text-blue-500" size={64} strokeWidth={1} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Secure Administration</h2>
              <p className="text-slate-500 text-sm max-w-xs text-center">Manage your employees, attendance and system settings.</p>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
