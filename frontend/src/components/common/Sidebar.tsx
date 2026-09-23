import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, MessageSquare, Settings, LogOut, Shield, Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

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
    <div className="w-64 bg-sidebar flex flex-col h-full shadow-soft z-20 shrink-0 text-slate-300">
      <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="text-sidebar" size={18} />
        </div>
        <span className="font-bold text-white text-lg">Eduplex</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full transition-colors font-medium ${
                isActive
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
        <div className="bg-surface-tint rounded-2xl p-4 mb-4 text-sidebar text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="w-10 h-10 bg-sidebar rounded-full flex items-center justify-center mx-auto mb-3">
            <Download className="text-primary" size={18} />
          </div>
          <h4 className="font-bold mb-1 text-sm">Download App</h4>
          <p className="text-xs text-sidebar/70 mb-3">Get our mobile app</p>
          <Button variant="primary" size="sm" className="w-full h-8 text-xs bg-sidebar text-primary hover:bg-sidebar/90">
            Download Now
          </Button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white font-medium w-full text-left rounded-full hover:bg-white/5 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
