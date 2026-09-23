import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, User, X } from 'lucide-react';
import { employeeService, Employee } from '../../../services/employee.service';
import { Modal } from '../../../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    salary: '',
    phone: '',
    status: 'active'
  });
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
      toast.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        full_name: employee.full_name,
        department: employee.department || '',
        salary: (employee as any).salary || '',
        phone: employee.phone || '',
        status: employee.status
      });
    } else {
      setEditingEmployee(null);
      setFormData({ full_name: '', department: '', salary: '', phone: '', status: 'active' });
    }
    setFaceImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFaceImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, {
          full_name: formData.full_name,
          department: formData.department,
          phone: formData.phone,
          status: formData.status
        });
        toast.success('Employee updated successfully');
      } else {
        const generatedCode = `EMP-${Date.now()}`;
        const newEmp = await employeeService.createEmployee({
          employee_code: generatedCode,
          full_name: formData.full_name,
          department: formData.department,
          phone: formData.phone,
          status: 'active'
        });
        
        if (faceImage && newEmp) {
          await employeeService.enrollFace(newEmp.id, faceImage);
        }
        toast.success('Employee added successfully');
      }
      await fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save employee', error);
      toast.error('Failed to save employee data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await employeeService.deleteEmployee(employeeToDelete);
        toast.success('Employee deleted successfully');
        await fetchEmployees();
      } catch (error) {
        console.error('Failed to delete employee', error);
        toast.error('Failed to delete employee.');
      } finally {
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchTerm))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden relative"
    >
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-shadow text-sm"
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Face Enrollment</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">No employees found.</td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                      <img 
                        src={`http://localhost:8000/api/v1/employees/${emp.id}/face/image`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                        className="w-full h-full object-cover"
                        alt={emp.full_name}
                      />
                      <User size={18} className="text-slate-400 hidden" />
                    </div>
                    <span className="font-medium text-slate-800">{emp.full_name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.phone || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{emp.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emp.status.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                      <Camera size={14} />
                      Enrolled
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(emp.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(emp)}
                        className="p-2 text-slate-400 hover:text-[var(--primary)] hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(emp.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input 
              required 
              type="text" 
              className="input-field"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
            <input 
              type="text" 
              className="input-field"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
            />
          </div>
          
          {editingEmployee && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="disable">Disable</option>
              </select>
            </div>
          )}

          {!editingEmployee && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Face Image</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                className="input-field py-2"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFaceImage(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="p-6 pt-12 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Employee?</h3>
                <p className="text-slate-500 mb-8">Are you sure you want to delete this employee? This action cannot be undone.</p>
                
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setDeleteModalOpen(false)} 
                    className="flex-1 btn-secondary py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployeesPage;
