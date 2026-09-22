import React from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecognitionResult } from '../../../services/recognition.service';
import { useNavigate } from 'react-router-dom';

interface SuccessScreenProps {
  result: RecognitionResult;
  onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ result, onContinue }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    onContinue();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-6 relative"
    >
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-100/40 blur-3xl" />
      
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 w-full max-w-lg text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Checkmark */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20"
        >
          <CheckCircle2 className="text-white" size={48} />
        </motion.div>

        <h2 className="text-[var(--primary)] font-semibold mb-2">Identity Confirmed</h2>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {result.full_name?.split(' ')[0] || 'Employee'}</h1>
        <p className="text-slate-500 text-sm mb-8">You have been recognized successfully</p>

        {/* Employee Card */}
        <div className="w-full bg-slate-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start text-left gap-4 border border-slate-100 mb-8">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
             {/* If we had a profile picture URL we would use it, else generic avatar */}
             <User className="text-slate-400" size={32} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-800 text-lg">{result.full_name}</h3>
            <p className="text-slate-500 text-sm">{result.employee_code}</p>
            <p className="text-slate-500 text-sm">{result.department}</p>
          </div>
        </div>

        {/* Action Status */}
        <div className="w-full flex items-center justify-between mb-8 px-2">
          <span className="text-slate-600 font-medium">Attendance Action</span>
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle2 size={16} />
            <span>Recorded</span>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-[var(--primary)] text-white font-medium py-3 rounded-xl hover:bg-[var(--primary-dark)] transition-colors duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;
