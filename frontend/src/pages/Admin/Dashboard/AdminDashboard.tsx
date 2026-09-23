import { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { employeeService, Employee } from '../../../services/employee.service';
import { attendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const StatCard = ({ title, value, subtext, icon, accentColor, iconBgColor }: any) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex items-center justify-between"
  >
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">
        <AnimatedCounter value={value} duration={1.5} />
      </h3>
      {subtext && (
        <p className="text-xs mt-1 font-medium text-slate-400">
          {subtext}
        </p>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} ${accentColor}`}>
      {icon}
    </div>
  </motion.div>
);

export const AdminDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emps, atts] = await Promise.all([
          employeeService.getEmployees(),
          attendanceService.getDailyAttendance()
        ]);
        setEmployees(emps);
        setAttendance(atts);
        toast.success("Dashboard data updated successfully");
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-slate-200 border-t-[var(--primary)] rounded-full"
        />
      </div>
    );
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'Active').length;
  const todayAttendance = attendance.length;
  
  const checkedIn = attendance.filter(a => a.check_in && !a.check_out).length;
  const checkedOut = attendance.filter(a => a.check_in && a.check_out).length;
  const pendingReviews = attendance.filter(a => a.needs_review).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="TOTAL EMPLOYEES" value={totalEmployees} subtext="Registered users" icon={<Users size={24} />} accentColor="text-blue-600" iconBgColor="bg-blue-50" />
        <StatCard title="ACTIVE EMPLOYEES" value={activeEmployees} subtext={`${((activeEmployees/totalEmployees)*100 || 0).toFixed(1)}% active`} icon={<UserCheck size={24} />} accentColor="text-green-600" iconBgColor="bg-green-50" />
        <StatCard title="TODAY'S ATTENDANCE" value={todayAttendance} subtext={`${((todayAttendance/activeEmployees)*100 || 0).toFixed(1)}% rate`} icon={<CalendarDays size={24} />} accentColor="text-teal-600" iconBgColor="bg-teal-50" />
        <StatCard title="CHECKED OUT" value={checkedOut} subtext="Completed shift" icon={<LogOut size={24} />} accentColor="text-rose-600" iconBgColor="bg-rose-50" />
        
        <StatCard title="CURRENTLY CHECKED IN" value={checkedIn} subtext="Present right now" icon={<LogIn size={24} />} accentColor="text-amber-600" iconBgColor="bg-amber-50" />
        <StatCard title="DISABLE EMPLOYEES" value={pendingReviews} subtext="Requires attention" icon={<AlertCircle size={24} />} accentColor="text-indigo-600" iconBgColor="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[400px]">
           <h3 className="font-bold text-slate-800 mb-6">Attendance History</h3>
           
           {/* Animated Skeleton Loader for Chart */}
           <div className="flex-1 w-full flex items-end gap-2 overflow-hidden px-4 pb-4">
             {[40, 70, 45, 90, 65, 80, 50, 100, 75, 60, 85, 55].map((height, i) => (
               <motion.div 
                 key={i}
                 className="flex-1 bg-slate-100 rounded-t-md"
                 style={{ height: `${height}%` }}
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
               />
             ))}
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[400px] flex flex-col overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-0 divide-y divide-slate-100">
             {attendance.slice(0, 8).map(record => {
               const emp = employees.find(e => e.id === record.employee_id);
               return (
                 <div key={record.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex flex-shrink-0 items-center justify-center border border-slate-200 overflow-hidden relative group-hover:border-teal-200 transition-colors">
                     <img 
                       src={`http://localhost:8000/api/v1/employees/${emp?.id}/face/image`}
                       onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                       className="w-full h-full object-cover"
                       alt={emp?.full_name}
                     />
                     <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold bg-slate-50 text-sm hidden">
                       {emp?.full_name?.charAt(0).toUpperCase() || '?'}
                     </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-semibold text-slate-900 truncate">{emp?.full_name || 'Unknown Employee'}</p>
                     <p className="text-xs text-slate-500 truncate mt-0.5">
                       {record.check_in ? 'Checked in' : ''} {record.check_out ? '& Checked out' : ''}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-medium text-slate-400">
                       {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                     </p>
                   </div>
                 </div>
               )
             })}
             {attendance.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                 <CalendarDays size={32} className="mb-2 opacity-20" />
                 <p className="text-sm">No activity today yet.</p>
               </div>
             )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
