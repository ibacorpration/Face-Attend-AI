import { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, LogOut, ChevronDown, CheckCircle2, Clock, MoreHorizontal } from 'lucide-react';
import { employeeService, Employee } from '../../../services/employee.service';
import { attendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
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
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const StatCard = ({ title, value, subtext, rate, icon, type }: any) => (
  <Card tinted className="flex flex-col relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      {rate && (
        <Badge variant="default" className="bg-white text-text-main">
          {rate}
        </Badge>
      )}
    </div>
    <div>
      <p className="text-sm font-semibold text-text-main mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-text-main">
          <AnimatedCounter value={value} duration={1.5} />
        </h3>
        {subtext && <span className="text-xs font-medium text-text-secondary">{subtext}</span>}
      </div>
    </div>
  </Card>
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
          className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full"
        />
      </div>
    );
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'Active').length;
  const todayAttendance = attendance.length;
  
  const checkedIn = attendance.filter(a => a.check_in && !a.check_out).length;
  const checkedOut = attendance.filter(a => a.check_in && a.check_out).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col lg:flex-row gap-6 lg:gap-8"
    >
      {/* Left Column */}
      <div className="flex-1 space-y-6 lg:space-y-8">
        
        {/* Top Cards */}
        <div>
          <h2 className="text-lg font-bold text-text-main mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Team" 
              value={totalEmployees} 
              subtext="Members" 
              icon={<Users size={20} className="text-sidebar" />} 
            />
            <StatCard 
              title="Active Today" 
              value={todayAttendance} 
              subtext="Checked in" 
              rate={`${((todayAttendance/activeEmployees)*100 || 0).toFixed(0)}%`}
              icon={<UserCheck size={20} className="text-sidebar" />} 
            />
            <StatCard 
              title="Completed Shift" 
              value={checkedOut} 
              subtext="Left" 
              icon={<LogOut size={20} className="text-sidebar" />} 
            />
          </div>
        </div>

        {/* Activity Chart Area */}
        <motion.div variants={itemVariants} className="bg-white rounded-[20px] shadow-soft border border-slate-100 p-6 flex flex-col h-[350px]">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-text-main text-lg">Hours Activity</h3>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-text-main hover:bg-slate-50 transition-colors">
               Weekly <ChevronDown size={14} />
             </button>
           </div>
           
           <div className="flex-1 w-full flex items-end gap-3 overflow-hidden px-2 pb-2">
             {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                 <motion.div 
                   className={`w-full rounded-t-md transition-colors ${i === 3 ? 'bg-primary' : 'bg-sidebar group-hover:bg-slate-700'}`}
                   initial={{ height: 0 }}
                   animate={{ height: `${height}%` }}
                   transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                 />
                 <span className="text-xs font-semibold text-text-secondary uppercase">
                   {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i]}
                 </span>
               </div>
             ))}
           </div>
        </motion.div>

        {/* Courses / Tasks equivalent (Shifts) */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-main">Ongoing Shifts</h2>
            <button className="w-8 h-8 rounded-full bg-primary text-sidebar flex items-center justify-center hover:bg-primary-light transition-colors">
              <span className="text-lg font-bold leading-none">+</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {attendance.filter(a => a.check_in && !a.check_out).slice(0, 3).map((record) => {
              const emp = employees.find(e => e.id === record.employee_id);
              return (
                <Card key={record.id} className="p-4 flex items-center gap-4 hover:shadow-soft-lg">
                  <div className="w-12 h-12 rounded-xl bg-surface-tint flex items-center justify-center overflow-hidden">
                    <img src={`http://localhost:8000/api/v1/employees/${emp?.id}/face/image`} className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-text-main">{emp?.full_name}</h4>
                    <p className="text-xs text-text-secondary">{emp?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary mb-1">Checked in</p>
                    <p className="font-semibold text-sm text-text-main">
                      {new Date(record.check_in!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="w-10 flex justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
                  </div>
                </Card>
              )
            })}
            {checkedIn === 0 && (
              <div className="text-center py-6 text-text-secondary text-sm bg-white rounded-2xl border border-slate-100">
                No ongoing shifts at the moment.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 space-y-6 lg:space-y-8">
        
        {/* Calendar Widget Placeholder */}
        <motion.div variants={itemVariants} className="bg-white rounded-[20px] shadow-soft border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-text-main text-lg">Daily Schedule</h3>
            <button className="text-text-secondary hover:text-text-main"><MoreHorizontal size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-main">Morning Standup</p>
                <p className="text-xs text-text-secondary">09:00 AM - 09:30 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-main">Weekly Review</p>
                <p className="text-xs text-text-secondary">02:00 PM - 03:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text-main">Shift Handover</p>
                <p className="text-xs text-text-secondary">05:00 PM - 05:30 PM</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assignments equivalent (Recent Logs) */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-main">Recent Logs</h2>
            <button className="w-8 h-8 rounded-full bg-surface-tint text-sidebar flex items-center justify-center hover:bg-primary transition-colors">
              <span className="text-lg font-bold leading-none">+</span>
            </button>
          </div>
          
          <div className="space-y-3">
             {attendance.slice(0, 4).map(record => {
               const emp = employees.find(e => e.id === record.employee_id);
               const status = record.check_out ? 'Completed' : 'In progress';
               const statusVariant = record.check_out ? 'success' : 'outline';
               
               return (
                 <Card key={record.id} className="p-4 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-text-secondary">
                     <CheckCircle2 size={18} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm text-text-main truncate">{emp?.full_name}</h4>
                     <p className="text-xs text-text-secondary truncate mt-0.5">
                       {new Date(record.check_in!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   </div>
                   <Badge variant={statusVariant} dot>
                     {status}
                   </Badge>
                 </Card>
               )
             })}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default AdminDashboard;
