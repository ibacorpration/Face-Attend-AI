import React, { useEffect, useState, useRef } from 'react';
import { Plus, Camera, Shield, Users, Lock, X, Trash2 } from 'lucide-react';
import { adminService, AdminUser } from '../../../services/admin.service';
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

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdmins();
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUsername(payload.sub);
      } catch (e) {}
    }
  }, []);

  const currentUser = admins.find(a => a.username === currentUsername);
  const isSuperUser = currentUser?.id === 1;

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setUsername('');
    setPassword('');
    setFaceImage(null);
    setIsAddModalOpen(true);
  };

  const handleOpenPasswordModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleDeleteAdmin = (id: number) => {
    if (id === 1) {
      toast.error("Cannot delete the main administrator");
      return;
    }
    setAdminToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    setIsSubmitting(true);
    try {
      await adminService.deleteAdmin(adminToDelete);
      toast.success("Admin deleted successfully");
      fetchAdmins();
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const newAdmin = await adminService.createAdmin({ username, password });
      
      if (faceImage) {
        await adminService.uploadFace(newAdmin.id, faceImage);
      }
      
      toast.success('Admin added successfully');
      setIsAddModalOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !selectedAdmin) return;
    setIsSubmitting(true);
    try {
      await adminService.updatePassword(selectedAdmin.id, { password });
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      toast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaceUpload = async (adminId: number, file: File) => {
    const loadingToast = toast.loading('Uploading face data...');
    try {
      await adminService.uploadFace(adminId, file);
      toast.success('Face registered successfully', { id: loadingToast });
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to register face', { id: loadingToast });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-500">Manage administrators and system configurations</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <Plus size={18} className="mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          Administrators
        </h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white rounded-[20px] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {admins.map(admin => (
              <motion.div key={admin.id} variants={itemVariants}>
                <Card className="flex items-center gap-4 p-5 hover:shadow-soft-lg group">
                  <div className="w-14 h-14 rounded-2xl bg-surface-tint flex items-center justify-center border-2 border-transparent group-hover:border-primary transition-colors overflow-hidden relative">
                    <Shield size={24} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 truncate text-lg">
                        {admin.username}
                      </h3>
                      {admin.has_face && (
                        <Badge variant="success" className="bg-green-100 text-green-700 py-0.5 px-2">Face Login</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Users size={14} />
                      <span className="truncate">Admin Account</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id={`face-upload-${admin.id}`}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFaceUpload(admin.id, e.target.files[0]);
                      }}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-10 h-10 p-0 rounded-xl"
                      onClick={() => document.getElementById(`face-upload-${admin.id}`)?.click()}
                      title="Upload Face"
                    >
                      <Camera size={16} />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-10 h-10 p-0 rounded-xl"
                      onClick={() => handleOpenPasswordModal(admin)}
                      title="Change Password"
                    >
                      <Lock size={16} />
                    </Button>
                    {isSuperUser && admin.id !== 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-10 h-10 p-0 rounded-xl text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        title="Delete Admin"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-soft-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Add New Admin</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                    <Input 
                      placeholder="Enter username" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <Input 
                      type="password"
                      placeholder="Enter password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Face Image (Optional)</label>
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                        faceImage ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={(e) => setFaceImage(e.target.files?.[0] || null)}
                      />
                      {faceImage ? (
                        <div className="text-primary font-medium flex items-center justify-center gap-2">
                          <Camera size={20} />
                          {faceImage.name}
                        </div>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-2">
                          <Camera size={24} className="text-slate-400" />
                          <span className="text-sm font-medium">Click to upload face image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Add Admin'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsPasswordModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-soft-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="mb-4 text-sm text-slate-500">
                  Changing password for <span className="font-bold text-slate-700">{selectedAdmin.username}</span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                  <Input 
                    type="password"
                    placeholder="Enter new password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-8 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsPasswordModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Admin Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-soft-xl overflow-hidden text-center p-8"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Admin?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. This admin will permanently lose access.</p>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0" onClick={confirmDelete} disabled={isSubmitting}>
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
