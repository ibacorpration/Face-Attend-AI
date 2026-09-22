import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements matching the reference's light, calm, spacious feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/40 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="text-white" size={24} /> {/* Placeholder for logo */}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FaceAttend AI</h1>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Smart Face Recognition Attendance</h2>
        <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
          Secure <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
          Fast <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
          Accurate
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="z-10 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 w-full max-w-3xl flex flex-col md:flex-row items-center gap-8 relative"
      >
        {/* Top center icon in the reference */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <ScanFace className="text-[var(--primary)]" size={32} />
        </div>

        {/* Employee Card - Primary Action */}
        <button 
          onClick={() => navigate('/camera')}
          className="flex-1 w-full text-left bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl transition-transform group-hover:scale-150" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-3">Employee</h3>
            <p className="text-teal-50 text-sm mb-12 leading-relaxed">
              Check in / Check out<br/>
              using face recognition
            </p>
            <div className="w-10 h-10 bg-white text-teal-600 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:translate-x-2">
              <ArrowRight size={20} />
            </div>
          </div>
        </button>

        {/* Admin Card - Secondary Action */}
        <button 
          onClick={() => navigate('/admin/login')}
          className="flex-1 w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-8 text-slate-800 relative group transition-transform hover:-translate-y-1 hover:shadow-md"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-4">
              <Shield className="text-slate-400" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Admin</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-grow">
              Manage employees,<br/>
              attendance and system
            </p>
            <div className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:translate-x-2 mt-auto">
              <ArrowRight size={20} />
            </div>
          </div>
        </button>

      </motion.div>
    </div>
  );
};

export default LandingPage;
