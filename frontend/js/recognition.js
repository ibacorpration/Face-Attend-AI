class RecognitionApp {
    constructor() {
        this.camera = new Camera('camera-feed', 'camera-overlay');
        this.isProcessing = false;
        this.scanInterval = null;
        this.init();
    }

    async init() {
        const started = await this.camera.start();
        if (started) {
            this.startScanning();
            document.getElementById('status-text').textContent = "Position your face in the frame";
        }
    }

    startScanning() {
        // Poll every 2 seconds
        this.scanInterval = setInterval(() => this.processFrame(), 2000);
    }

    async processFrame() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.camera.showOverlayScan();
        
        try {
            const blob = await this.camera.captureBlob();
            if (!blob) throw new Error("Could not capture image");
            
            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');
            
            const result = await fetchAPI('/recognition/verify', {
                method: 'POST',
                body: formData
            });
            
            if (result.success) {
                this.handleSuccess(result);
            } else {
                this.handleError(result.error || "Face not recognized");
            }
        } catch (error) {
            console.error("Frame processing error:", error);
        } finally {
            this.camera.hideOverlayScan();
            // Short cooldown before allowing next processing flag
            setTimeout(() => { this.isProcessing = false; }, 500);
        }
    }

    handleSuccess(result) {
        // Pause scanning
        clearInterval(this.scanInterval);
        
        const overlay = document.getElementById('camera-overlay');
        overlay.classList.remove('scanning', 'error');
        overlay.classList.add('success');
        document.getElementById('status-text').textContent = "Recognized!";
        
        const card = document.getElementById('result-card');
        const nameEl = document.getElementById('employee-name');
        const statusEl = document.getElementById('match-status');
        
        nameEl.textContent = `Welcome, ${result.full_name}`;
        
        if (result.status === 'match') {
            statusEl.textContent = "Attendance Logged Successfully";
            statusEl.style.color = "var(--success)";
        } else if (result.status === 'borderline') {
            statusEl.textContent = "Pending Review (Borderline Match)";
            statusEl.style.color = "var(--warning)";
        }
        
        card.classList.remove('hidden');
        card.classList.add('pop-in');
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
            window.location.href = `/pages/profile.html?id=${result.employee_id}&status=${result.status}`;
        }, 2000);
    }

    handleError(errorMsg) {
        // Only show red error if it's actually an unrecognized face (not just empty frame)
        if (errorMsg.includes('Face not recognized') || errorMsg.includes('similarity')) {
            const overlay = document.getElementById('camera-overlay');
            overlay.classList.remove('scanning', 'success');
            overlay.classList.add('error');
            document.getElementById('status-text').textContent = "Not Recognized / Not in Team";
            
            // Revert back to scanning after 2 seconds
            setTimeout(() => {
                if(this.isProcessing) return;
                overlay.classList.remove('error');
                overlay.classList.add('scanning');
                document.getElementById('status-text').textContent = "Position your face in the frame";
            }, 2000);
        }
    }
}

// Start app when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('camera-feed')) {
        window.app = new RecognitionApp();
    }
});
