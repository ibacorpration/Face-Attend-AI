import { useEffect, useState } from 'react';
import { Search, Calendar, Download, FileText, MapPin } from 'lucide-react';
import { attendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { employeeService, Employee } from '../../../services/employee.service';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const AttendancePage = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchData(dateFilter);
  }, [dateFilter]);

  const fetchData = async (date: string) => {
    setIsLoading(true);
    try {
      const [atts, emps] = await Promise.all([
        attendanceService.getDailyAttendance(date),
        employeeService.getEmployees()
      ]);
      setAttendance(atts);
      setEmployees(emps);
    } catch (error) {
      console.error('Failed to fetch attendance data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    attendanceService.exportAttendance(dateFilter);
  };

  const calculateDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '—';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getEmployeeName = (id: number) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.full_name : 'Unknown';
  };

  const getEmployeeImage = (id: number) => {
    const emp = employees.find(e => e.id === id);
    return `/api/v1/employees/${id}/face/image?v=${emp?.updated_at || ''}`;
  };

  const filteredData = attendance.filter(record => {
    const nameMatch = getEmployeeName(record.employee_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    let statusMatch = true;
    if (statusFilter === 'Present') statusMatch = record.check_in !== null;
    if (statusFilter === 'Checked Out') statusMatch = record.check_out !== null;
    if (statusFilter === 'In Progress') statusMatch = record.check_in !== null && record.check_out === null;

    return nameMatch && statusMatch;
  });

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto">
      
      {/* Filters & Actions */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sticky top-0 z-10">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <Input 
              placeholder="Search employee..." 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-white text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow cursor-pointer"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-full border border-slate-200 bg-white text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow appearance-none"
          >
            <option>All</option>
            <option>Present</option>
            <option>In Progress</option>
            <option>Checked Out</option>
          </select>
        </div>
        
        <Button variant="secondary" onClick={handleExport}>
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </Card>

      {/* Attendance List */}
      <div className="flex-1 overflow-y-auto pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-white rounded-[20px] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-text-secondary bg-white rounded-[20px] border border-slate-100">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium text-text-main">No attendance records found</p>
            <p className="text-sm mt-1">Try adjusting your date or filters.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredData.map(record => {
              const status = record.check_out ? 'Completed' : (record.check_in ? 'In Progress' : 'Absent');
              const statusVariant = record.check_out ? 'success' : (record.check_in ? 'warning' : 'default');

              return (
                <motion.div key={record.id} variants={itemVariants}>
                  <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-soft-lg group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-surface-tint flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                        <img 
                          src={getEmployeeImage(record.employee_id)} 
                          className="w-full h-full object-cover" 
                          onError={e => e.currentTarget.style.display = 'none'} 
                          alt="" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-text-main truncate">{getEmployeeName(record.employee_id)}</h4>
                        <p className="text-xs text-text-secondary truncate mt-0.5 flex items-center gap-1">
                          <MapPin size={12} /> HQ Office
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-2/3">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-text-secondary mb-1">Check In</p>
                        <p className="font-semibold text-sm text-text-main flex items-center gap-1">
                          {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                      
                      <div className="w-16 h-px bg-slate-200 hidden sm:block"></div>
                      
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-text-secondary mb-1">Check Out</p>
                        <p className="font-semibold text-sm text-text-main flex items-center gap-1">
                          {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right w-24">
                        <p className="text-xs text-text-secondary mb-1">Duration</p>
                        <p className="font-semibold text-sm text-text-main">
                          {calculateDuration(record.check_in, record.check_out)}
                        </p>
                      </div>

                      <div className="w-24 flex justify-end">
                        <Badge variant={statusVariant} dot>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
