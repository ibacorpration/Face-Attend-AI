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
                // If it's just "Face not recognized" we can silently ignore and keep scanning
                // Or if it's "no face detected", keep scanning
                console.log(result.error);
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
        
        const card = document.getElementById('result-card');
        const nameEl = document.getElementById('employee-name');
        const statusEl = document.getElementById('match-status');
        
        nameEl.textContent = `Welcome, ${result.full_name}`;
        
        if (result.status === 'match') {
            statusEl.textContent = "Attendance Logged Successfully";
            statusEl.style.color = "var(--success)";
            Toast.show(`Check-in successful: ${result.full_name}`, 'success');
        } else if (result.status === 'borderline') {
            statusEl.textContent = "Pending Review (Borderline Match)";
            statusEl.style.color = "var(--warning)";
            Toast.show(`Requires review: ${result.full_name}`, 'warning');
        }
        
        card.classList.remove('hidden');
        card.classList.add('pop-in');
        
        // Resume scanning after 5 seconds
        setTimeout(() => {
            card.classList.add('hidden');
            card.classList.remove('pop-in');
            this.startScanning();
        }, 5000);
    }
}

// Start app when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('camera-feed')) {
        window.app = new RecognitionApp();
    }
});
