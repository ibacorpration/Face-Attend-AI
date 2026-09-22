import { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarDays, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { employeeService, Employee } from '../../../services/employee.service';
import { attendanceService, AttendanceRecord } from '../../../services/attendance.service';

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && (
        <p className={`text-xs mt-1 font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
          {subtext}
        </p>
      )}
    </div>
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[var(--primary)] border border-slate-100">
      {icon}
    </div>
  </div>
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p className="text-slate-500 font-medium">Loading dashboard...</p></div>;
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'Active').length;
  const todayAttendance = attendance.length;
  
  const checkedIn = attendance.filter(a => a.check_in && !a.check_out).length;
  const checkedOut = attendance.filter(a => a.check_in && a.check_out).length;
  const pendingReviews = attendance.filter(a => a.needs_review).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Employees" value={totalEmployees} subtext="Registered users" icon={<Users size={24} />} />
        <StatCard title="Active Employees" value={activeEmployees} subtext={`${((activeEmployees/totalEmployees)*100 || 0).toFixed(1)}% active`} icon={<UserCheck size={24} />} trend="up" />
        <StatCard title="Today's Attendance" value={todayAttendance} subtext={`${((todayAttendance/activeEmployees)*100 || 0).toFixed(1)}% rate`} icon={<CalendarDays size={24} />} trend="up" />
        <StatCard title="Currently Checked In" value={checkedIn} subtext="Present right now" icon={<LogIn size={24} />} />
        <StatCard title="Checked Out" value={checkedOut} subtext="Completed shift" icon={<LogOut size={24} />} />
        <StatCard title="Pending Reviews" value={pendingReviews} subtext="Requires attention" icon={<AlertCircle size={24} />} trend={pendingReviews > 0 ? 'down' : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-96 flex items-center justify-center">
           {/* Chart Placeholder */}
           <div className="text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <CalendarDays className="text-slate-300" size={24} />
             </div>
             <p className="text-slate-500 font-medium">Attendance history chart will appear here</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
             {attendance.slice(0, 5).map(record => {
               const emp = employees.find(e => e.id === record.employee_id);
               return (
                 <div key={record.id} className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-teal-50 flex flex-shrink-0 items-center justify-center text-teal-600 font-bold">
                     {emp?.full_name?.charAt(0) || '?'}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">{emp?.full_name || 'Unknown'}</p>
                     <p className="text-xs text-slate-500 mt-1">
                       {record.check_in ? 'Checked in' : ''} {record.check_out ? '& Checked out' : ''}
                     </p>
                     <p className="text-xs text-slate-400 mt-1">{record.check_in ? new Date(record.check_in).toLocaleTimeString() : ''}</p>
                   </div>
                 </div>
               )
             })}
             {attendance.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No activity today yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
