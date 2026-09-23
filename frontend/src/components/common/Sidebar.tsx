import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, MessageSquare, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { path: '/admin/employees', icon: <Users size={20} />, label: 'Employees' },
  { path: '/admin/attendance', icon: <CalendarDays size={20} />, label: 'Attendance' },
  { path: '/admin/messages', icon: <MessageSquare size={20} />, label: 'Messages', badge: 3 },
  { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm z-20 shrink-0">
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-50">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
          <Shield className="text-white" size={18} />
        </div>
        <span className="font-bold text-slate-800 text-lg">FaceAttend AI</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-teal-50 border-l-4 border-[var(--primary)] text-[var(--primary)] font-bold rounded-r-xl rounded-l-none'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium w-full text-left rounded-xl hover:bg-slate-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
