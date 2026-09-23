import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Welcome back Admin 👋', subtitle: 'Explore your Eduplex dashboard' },
  '/admin/employees': { title: 'My Team', subtitle: 'Manage your team members and roles' },
  '/admin/attendance': { title: 'Attendance Log', subtitle: 'Monitor daily check-ins and check-outs' },
  '/admin/messages': { title: 'Messages', subtitle: 'System notifications and alerts' },
  '/admin/settings': { title: 'Settings', subtitle: 'Application configuration' },
};

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const headerInfo = routeTitles[location.pathname] || { title: 'Dashboard', subtitle: '' };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-text-main">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
        
        {/* Header */}
        <header className="h-24 px-6 lg:px-10 flex items-center justify-between shrink-0 bg-background md:bg-transparent">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-text-main p-2 hover:bg-slate-200 rounded-full transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-main tracking-tight">{headerInfo.title}</h1>
              {headerInfo.subtitle && <p className="text-sm text-text-secondary mt-1 hidden sm:block">{headerInfo.subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden lg:block w-64">
               <Input placeholder="Search..." icon={<Search size={18} />} className="bg-white" />
            </div>

            <button 
              onClick={() => toast.info('No new notifications')}
              className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center text-text-secondary hover:text-text-main hover:shadow-soft transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=C6F135&color=111112&bold=true" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};
