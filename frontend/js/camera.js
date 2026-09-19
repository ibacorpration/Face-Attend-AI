class Camera {
    constructor(videoElementId, overlayId) {
        this.video = document.getElementById(videoElementId);
        this.overlay = document.getElementById(overlayId);
        this.stream = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            });
            this.video.srcObject = this.stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve(true);
                };
            });
        } catch (error) {
            console.error("Camera error:", error);
            Toast.show("Failed to access camera. Please allow permissions.", "error");
            return false;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
    }

    async captureBlob() {
        if (!this.video.videoWidth) return null;
        
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        return new Promise(resolve => {
            this.canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }

    showOverlayScan() {
        if(this.overlay) {
            this.overlay.classList.add('scanning');
        }
    }
    
    hideOverlayScan() {
        if(this.overlay) {
            this.overlay.classList.remove('scanning');
        }
    }
}
