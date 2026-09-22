import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useCamera } from '../../../hooks/useCamera';
import { employeeService, Employee } from '../../../services/employee.service';

interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export const FaceEnrollmentModal: React.FC<FaceEnrollmentModalProps> = ({ isOpen, onClose, employee, onSuccess }) => {
  const { videoRef, isStreamActive, startCamera, stopCamera, captureFrame } = useCamera();
  const [enrollStatus, setEnrollStatus] = useState<string>('Initializing camera...');

  useEffect(() => {
    if (isOpen) {
      setEnrollStatus('Initializing camera...');
      startCamera().then(() => setEnrollStatus('Look directly at the camera'));
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const handleCaptureAndEnroll = async () => {
    if (!employee) return;
    const blob = captureFrame();
    if (!blob) {
      setEnrollStatus('Failed to capture frame. Please try again.');
      return;
    }
    
    setEnrollStatus('Uploading and registering face...');
    try {
      await employeeService.enrollFace(employee.id, blob);
      setEnrollStatus('Face registered successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Enrollment failed', error);
      setEnrollStatus('Enrollment failed. Ensure face is clear.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Face Enrollment: ${employee?.full_name}`}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-sm aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Target overlay */}
          <div className="absolute inset-0 border-[40px] border-black/30 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-[var(--primary)] rounded-full border-dashed" />
          </div>
        </div>
        
        <p className={`text-sm font-medium mb-6 ${enrollStatus.includes('success') ? 'text-green-600' : enrollStatus.includes('failed') ? 'text-red-500' : 'text-slate-600'}`}>
          {enrollStatus}
        </p>

        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleCaptureAndEnroll} 
            disabled={!isStreamActive || enrollStatus.includes('registering')}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Capture Face
          </button>
        </div>
      </div>
    </Modal>
  );
};
