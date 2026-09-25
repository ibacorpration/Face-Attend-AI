import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ibaMascotFull from '../../assets/iba-mascot-full.png';
import ibaMascotIcon from '../../assets/iba-mascot-icon.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [robotActive, setRobotActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7FB] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#5B2A72]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1200px] md:min-h-[660px] bg-white rounded-[24px] md:rounded-[32px] shadow-[0_30px_60px_rgba(32,21,47,0.08)] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side (Dark Purple) */}
        <div className="w-full md:w-[48%] bg-[#20152F] relative flex flex-col p-8 md:p-12 overflow-hidden text-white min-h-[450px] md:min-h-0">
           {/* Subtle radial glow inside left panel */}
           <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#5B2A72]/40 blur-[100px] rounded-full pointer-events-none" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#5B2A72]/30 blur-[120px] rounded-full pointer-events-none" />

           {/* Header */}
           <div className="flex items-center gap-3 relative z-10 mb-16">
              <div className="w-8 h-8 bg-[#291A3A] rounded-lg flex items-center justify-center p-1.5 border border-[#5B2A72]/50">
                <img src={ibaMascotIcon} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg tracking-wide">IBA Corpration</span>
           </div>

           {/* Hero Text */}
           <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold leading-[1.1] tracking-tight mb-4 md:mb-6">
                Smarter<br/>
                Attendance<br/>
                <span className="text-[#C6F135]">Starts Here</span>
              </h1>
           </div>

           {/* Robot Area */}
           <div className="mt-8 md:mt-auto relative z-10 flex flex-col items-center justify-end pt-8 md:pt-12">
             {!robotActive && (
               <div 
                 className="relative cursor-pointer group flex flex-col items-center"
                 onClick={() => setRobotActive(true)}
               >
                 {/* Platform */}
                 <div className="absolute bottom-0 w-72 md:w-96 h-20 md:h-24 bg-[#291A3A] rounded-[100%] border-t-2 border-[#5B2A72] shadow-[0_0_30px_rgba(91,42,114,0.6)] flex items-center justify-center">
                   <div className="w-60 md:w-80 h-14 md:h-16 rounded-[100%] border border-[#C6F135]/40 shadow-[0_0_20px_rgba(198,241,53,0.3)] group-hover:border-[#C6F135]/70 transition-colors duration-500"></div>
                 </div>

                 <motion.div
                   animate={{ y: [0, -5, 0], scale: [1, 1.008, 1] }}
                   transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                   className="relative z-10 pb-4 md:pb-6"
                 >
                   <motion.img 
                     layoutId="robot-mascot"
                     src={ibaMascotFull} 
                     alt="Robot Mascot" 
                     className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" 
                   />
                 </motion.div>
               </div>
             )}
           </div>
        </div>

        {/* Right Side (White) */}
        <div className="w-full md:w-[52%] bg-white relative flex flex-col justify-center p-6 md:p-10 lg:p-14">


           {/* Actions */}
           <div className="flex flex-col gap-6 w-full max-w-[460px] mx-auto mt-2">
             
             {/* Face Attend Card */}
             <motion.div 
               whileHover={{ y: -8 }}
               transition={{ type: "spring", stiffness: 400, damping: 25 }}
               className="group cursor-pointer bg-[#C6F135] rounded-[28px] p-6 flex items-center gap-5 shadow-[0_15px_30px_rgba(198,241,53,0.2)] hover:shadow-[0_20px_40px_rgba(91,42,114,0.3)] transition-shadow duration-300 relative overflow-hidden"
               onClick={() => navigate('/camera')}
             >
               {/* Subtle gradient inside */}
               <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>

               <div className="w-16 h-16 bg-[#D7F563] rounded-2xl flex items-center justify-center shrink-0 shadow-sm p-2">
                 <img src={ibaMascotIcon} alt="Icon" className="w-full h-full object-contain drop-shadow-sm" />
               </div>
               <div className="flex-grow relative z-10">
                 <h3 className="text-xl font-bold text-[#20152F] mb-1">Face Attend</h3>
                 <p className="text-[#20152F]/70 text-sm leading-snug">
                   Check-in and Check-out
                 </p>
               </div>
               <div className="w-10 h-10 rounded-full bg-[#20152F] text-[#C6F135] flex items-center justify-center shrink-0 group-hover:translate-x-1.5 group-hover:bg-[#5B2A72] group-hover:text-white transition-all duration-200 relative z-10">
                 <ArrowRight size={20} strokeWidth={2} />
               </div>
             </motion.div>

             {/* Admin Card */}
             <motion.div 
               whileHover={{ y: -8 }}
               transition={{ type: "spring", stiffness: 400, damping: 25 }}
               className="group cursor-pointer bg-white rounded-[28px] p-6 flex items-center gap-5 border border-[#EBEAEF] shadow-[0_10px_30px_rgba(32,21,47,0.03)] hover:shadow-[0_20px_40px_rgba(91,42,114,0.2)] hover:border-[#D0CDE0] transition-colors transition-shadow duration-300 relative"
               onClick={() => navigate('/admin/login')}
             >
               <div className="w-16 h-16 bg-[#F2F0F7] rounded-2xl flex items-center justify-center shrink-0 shadow-sm p-1.5 overflow-hidden">
                 <img src={ibaMascotFull} alt="Admin Icon" className="w-full h-full object-contain drop-shadow-sm" />
               </div>
               <div className="flex-grow relative z-10">
                 <h3 className="text-xl font-bold text-[#20152F] mb-1">Admin</h3>
                 <p className="text-[#858592] text-sm leading-snug">
                   Manage your team
                 </p>
               </div>
               <div className="w-10 h-10 rounded-full bg-[#F2F0F7] text-[#858592] flex items-center justify-center shrink-0 group-hover:translate-x-1.5 group-hover:bg-[#5B2A72] group-hover:text-white transition-all duration-200 relative z-10">
                 <ArrowRight size={20} strokeWidth={2} />
               </div>
             </motion.div>

           </div>

        </div>
      </motion.div>

      {/* Full Screen Robot Interaction */}
      <AnimatePresence>
        {robotActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#20152F]/90 backdrop-blur-md cursor-pointer"
            onClick={() => setRobotActive(false)}
          >
            <div className="relative">
               {/* Huge glow when active */}
               <div className="absolute inset-0 bg-[#C6F135]/20 blur-[100px] rounded-full w-full h-full" />
               <motion.img 
                 layoutId="robot-mascot"
                 src={ibaMascotFull} 
                 alt="Robot Mascot Active" 
                 className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.8)] relative z-10" 
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
