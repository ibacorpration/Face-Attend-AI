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
                // Previously only two hardcoded substrings were handled here and
                // every other backend error (no face detected, blurry image,
                // liveness failure, inactive employee...) was silently dropped,
                // which is why nothing appeared to happen. Now every case gets
                // a visible message.
                this.handleError(result);
            }
        } catch (error) {
            console.error("Frame processing error:", error);
            // Network / server errors used to be invisible to the user too.
            document.getElementById('status-text').textContent =
                "Connection problem — retrying...";
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
            const params = new URLSearchParams({
                id: result.employee_id,
                status: result.status,
                name: result.full_name || '',
                code: result.employee_code || '',
                dept: result.department || '',
                estatus: result.employee_status || ''
            });
            window.location.href = `/pages/profile.html?${params.toString()}`;
        }, 2000);
    }

    handleError(result) {
        const errorMsg = (result && result.error) || "Face not recognized";
        const overlay = document.getElementById('camera-overlay');
        const statusText = document.getElementById('status-text');

        overlay.classList.remove('scanning', 'success');
        overlay.classList.add('error');

        let displayMsg;
        if (errorMsg.includes('No face detected')) {
            displayMsg = "No face detected — please face the camera directly";
        } else if (errorMsg.includes('Quality failed')) {
            displayMsg = "Image too blurry/dark — hold steady and improve lighting";
        } else if (errorMsg.includes('Liveness failed')) {
            displayMsg = "Liveness check failed — look directly at the camera";
        } else if (errorMsg.includes('Employee not found or inactive')) {
            displayMsg = "Your account is inactive. Please contact HR.";
        } else if (result && result.status === 'unknown') {
            displayMsg = "Not Recognized / Not in Team";
        } else {
            // Fallback: still SHOW something instead of doing nothing.
            displayMsg = errorMsg;
        }

        statusText.textContent = displayMsg;

        // Revert back to scanning after a short pause
        setTimeout(() => {
            if (this.isProcessing) return;
            overlay.classList.remove('error');
            overlay.classList.add('scanning');
            statusText.textContent = "Position your face in the frame";
        }, 2500);
    }
}

// Start app when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('camera-feed')) {
        window.app = new RecognitionApp();
    }
});