import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import ibaMascotFull from '../../assets/iba-mascot-full.png';
import ibaMascotIcon from '../../assets/iba-mascot-icon.png';

import MascotAnimation from '../../components/MascotAnimation/MascotAnimation';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative background matching Eduplex */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sidebar/5 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <MascotAnimation src={ibaMascotFull} className="w-24 h-24" />
          <h1 className="text-3xl font-bold text-text-main tracking-tight">IBA Corporation<span className="text-primary">.</span></h1>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-text-main mb-4 tracking-tight leading-tight">
          Smart Attendance
        </h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-3xl flex flex-col md:flex-row gap-6 relative"
      >
        {/* Employee Card - Primary Action */}
        <Card tinted className="flex-1 p-8 relative overflow-hidden group cursor-pointer border-2 border-transparent hover:border-primary/50 transition-colors" onClick={() => navigate('/camera')}>
          <div className="relative z-10 flex flex-col h-full items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-sidebar">
              <img src={ibaMascotIcon} alt="Employee Mascot" className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-text-main mb-3">Face Attend</h3>
            <p className="text-text-secondary mb-10 flex-grow">
              check-in and check-out
            </p>
            <div className="flex items-center justify-between mt-auto w-full">
              <span className="font-bold text-sm text-text-main group-hover:text-sidebar transition-colors">Launch Camera</span>
              <div className="w-10 h-10 bg-sidebar text-primary rounded-full flex items-center justify-center transition-transform group-hover:translate-x-2">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Card>

        {/* Admin Card - Secondary Action */}
        <Card className="flex-1 p-8 relative overflow-hidden group cursor-pointer border-2 border-transparent hover:border-sidebar/10 transition-colors" onClick={() => navigate('/admin/login')}>
          <div className="relative z-10 flex flex-col h-full items-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-600">
              <img src={ibaMascotFull} alt="Admin Mascot" className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-text-main mb-3">Admin</h3>
            <p className="text-text-secondary mb-10 flex-grow">
              Manage your team
            </p>
            <div className="flex items-center justify-between mt-auto w-full">
              <span className="font-bold text-sm text-text-main group-hover:text-sidebar transition-colors">Sign In</span>
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-2 group-hover:bg-sidebar group-hover:text-white">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LandingPage;
