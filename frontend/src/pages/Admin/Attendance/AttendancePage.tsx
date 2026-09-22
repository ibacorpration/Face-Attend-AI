import React, { useEffect, useState } from 'react';
import { Search, Calendar, Download, FileText } from 'lucide-react';
import { attendanceService, AttendanceRecord } from '../../../services/attendance.service';
import { employeeService, Employee } from '../../../services/employee.service';

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
    return emp ? emp.full_name : `Unknown (ID: ${id})`;
  };

  const filteredRecords = attendance.filter(record => {
    const empName = getEmployeeName(record.employee_id).toLowerCase();
    const matchesSearch = empName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <button onClick={handleExport} className="btn-secondary flex items-center justify-center gap-2 whitespace-nowrap">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Check-in</th>
              <th className="px-6 py-4">Check-out</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">Loading records...</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                     <FileText size={48} className="text-slate-200 mb-4" />
                     <p className="text-slate-500 font-medium">No attendance records found</p>
                     <p className="text-slate-400 text-xs mt-1">Try changing the date or search filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {getEmployeeName(record.employee_id)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{record.date}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {calculateDuration(record.check_in, record.check_out)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status.toLowerCase() === 'present' 
                        ? 'bg-green-100 text-green-700'
                        : record.status.toLowerCase() === 'late'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                    {record.needs_review && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        REVIEW
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
