import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'System overview and key statistics' },
  '/admin/employees': { title: 'Employees', subtitle: 'Manage your team members' },
  '/admin/attendance': { title: 'Attendance', subtitle: 'View and export attendance records' },
  '/admin/reviews': { title: 'Recognition Reviews', subtitle: 'Review borderline face matches' },
  '/admin/messages': { title: 'Messages', subtitle: 'System notifications and alerts' },
  '/admin/settings': { title: 'Settings', subtitle: 'Application configuration' },
};

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const headerInfo = routeTitles[location.pathname] || { title: 'Admin', subtitle: '' };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{headerInfo.title}</h1>
            <p className="text-sm text-slate-500">{headerInfo.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => toast.info('No new notifications')}
              className="relative text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=008b8b&color=fff" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-slate-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};
