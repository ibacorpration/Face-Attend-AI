import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, Users, X } from 'lucide-react';
import { employeeService, Employee } from '../../../services/employee.service';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
      toast.error('Failed to load team data');
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
    if (!formData.full_name) {
      toast.error('Full name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      let savedEmployee;
      if (editingEmployee) {
        savedEmployee = await employeeService.updateEmployee(editingEmployee.id, formData);
        toast.success('Member updated successfully');
      } else {
        savedEmployee = await employeeService.createEmployee(formData);
        toast.success('Member added successfully');
      }

      if (faceImage) {
        await employeeService.enrollFace(savedEmployee.id, faceImage);
        toast.success('Face data registered');
      }

      handleCloseModal();
      await fetchEmployees();
    } catch (error: any) {
      console.error('Failed to save employee', error);
      toast.error(error.response?.data?.detail || 'Failed to save member details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await employeeService.deleteEmployee(employeeToDelete);
        toast.success('Member removed');
        await fetchEmployees();
      } catch (error) {
        toast.error('Failed to remove member');
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
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input 
            placeholder="Search by name or phone..." 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-[20px] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>No team members found.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredEmployees.map(emp => (
              <motion.div key={emp.id} variants={itemVariants}>
                <Card className="flex items-center gap-4 p-5 hover:shadow-soft-lg group">
                  <div className="w-14 h-14 rounded-2xl bg-surface-tint flex items-center justify-center border-2 border-transparent group-hover:border-primary transition-colors overflow-hidden relative">
                    <img 
                      src={`/api/v1/employees/${emp.id}/face/image`}
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                      className="w-full h-full object-cover"
                      alt={emp.full_name}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold bg-slate-50 text-xl hidden">
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-base text-text-main truncate">{emp.full_name}</h4>
                      {(emp as any).face_encodings && (emp as any).face_encodings.length > 0 ? (
                        <Badge variant="success" className="px-1.5 py-0">
                          <Camera size={10} className="mr-1" /> Enrolled
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="px-1.5 py-0">Pending Face</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span>{emp.department || 'No Dept'}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{emp.phone || 'No Phone'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={emp.status.toLowerCase() === 'active' ? 'success' : 'default'} dot>
                      {emp.status}
                    </Badge>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(emp)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(emp.id)} className="p-2 text-slate-400 hover:text-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-sidebar/80 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-[24px] shadow-soft-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-text-main">{editingEmployee ? 'Edit Member' : 'Add Member'}</h3>
                  <p className="text-sm text-text-secondary mt-1">Fill out the details below.</p>
                </div>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-text-main hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <form id="employeeForm" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Full Name</label>
                    <Input 
                      required 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                      placeholder="e.g. Taylor Smith" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2">Phone</label>
                      <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        placeholder="e.g. 555-0123" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2">Department</label>
                      <Input 
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})} 
                        placeholder="e.g. Design" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2">Status</label>
                      <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full h-11 px-4 rounded-full border border-slate-200 bg-white text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Face Image</label>
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${faceImage ? 'border-primary bg-surface-tint' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={(e) => { if(e.target.files && e.target.files[0]) setFaceImage(e.target.files[0]) }} 
                        className="hidden" 
                      />
                      <Camera size={32} className={`mx-auto mb-3 ${faceImage ? 'text-primary-dark' : 'text-slate-300'}`} />
                      {faceImage ? (
                        <p className="text-sm font-medium text-primary-dark">{faceImage.name}</p>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-text-main">Click to upload photo</p>
                          <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 sticky bottom-0">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" form="employeeForm" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Member'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteModalOpen && (
          <div className="fixed inset-0 bg-sidebar/80 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-sidebar rounded-[32px] p-10 max-w-sm w-full text-center shadow-soft-lg border border-sidebar/50"
            >
              <div className="w-20 h-20 bg-error/10 text-error rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Remove Member?</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">This action cannot be undone. This will permanently delete the member and their face data.</p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-white/5 text-white hover:bg-white/10" variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-error text-white hover:bg-error/90" variant="primary" onClick={confirmDelete}>Remove</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeesPage;
