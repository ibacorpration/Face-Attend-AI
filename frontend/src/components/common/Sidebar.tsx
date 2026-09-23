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
    navigate('/');
  };

  return (
    <div className="w-64 bg-sidebar flex flex-col h-full shadow-soft z-20 shrink-0 text-slate-300">
      <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="text-sidebar" size={18} />
        </div>
        <span className="font-bold text-white text-lg"> IBA Corpration </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full transition-colors font-medium ${isActive
                ? 'bg-primary text-sidebar'
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-primary text-sidebar text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-error font-medium w-full text-left rounded-full hover:bg-error/10 transition-colors group"
        >
          <LogOut size={20} className="group-hover:text-error transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
