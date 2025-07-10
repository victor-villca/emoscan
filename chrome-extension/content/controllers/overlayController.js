class OverlayController {
  constructor() {
    this.overlay = null;
    this.isActive = false;
    this.sessionStartTime = null;
    this.sessionTimer = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.videoEl = null;
    this.canvasEl = null;
    this.faceDetectionInterval = null;
    this.isRecording = false;
    this.lastSend = 0;
    this.faceCount = 0;
    this.SEND_INTERVAL = 1500;
  }

  async init() {
    this.initSessionTimer();
    this.attachEventListeners();
    this.isActive = true;
    await this.startScreenCapture();
    console.log("OverlayController initialized. Session timer started.");
  }

  async loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(chrome.runtime.getURL('js/models'));
      console.log("Face API models loaded");
    } catch (error) {
      console.error("Error loading Face API models:", error);
    }
  }

  async startScreenCapture() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });

      this.videoEl = document.createElement("video");
      this.videoEl.srcObject = stream;
      this.videoEl.play();

      this.canvasEl = document.createElement("canvas");
      this.canvasEl.style.display = "none";
      document.body.appendChild(this.canvasEl);

      const trackSettings = stream.getVideoTracks()[0].getSettings();
      this.canvasEl.width = trackSettings.width || 1280;
      this.canvasEl.height = trackSettings.height || 720;

      await this.loadModels();

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9"
      });

      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "screen-recording.webm";
        a.click();
        URL.revokeObjectURL(url);
        this.stopFaceDetection();
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      this.startFaceDetection();

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
          this.isRecording = false;
        }
      });

    } catch (err) {
      console.error("Error iniciando captura:", err);
    }
  }

  startFaceDetection() {
    this.faceDetectionInterval = setInterval(async () => {
      if (!this.isRecording) return;
      
      const ctx = this.canvasEl.getContext("2d");
      ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);

      try {
        const detections = await faceapi.detectAllFaces(this.canvasEl, new faceapi.TinyFaceDetectorOptions());
        console.log("Faces detected:", detections.length);
        
        this.faceCount += detections.length;
        this.updateFaceCounter(this.faceCount);

        for (let i = 0; i < detections.length; i++) {
          const box = detections[i].box;

          const faceCanvas = document.createElement("canvas");
          faceCanvas.width = box.width;
          faceCanvas.height = box.height;

          faceCanvas
            .getContext("2d")
            .drawImage(this.canvasEl, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

          if (Date.now() - this.lastSend > this.SEND_INTERVAL) {
            this.lastSend = Date.now();
            this.sendFaceToBackend(faceCanvas);
          }
        }
      } catch (error) {
        console.error("Error en detección facial:", error);
      }
    }, 1500);
  }

  async sendFaceToBackend(canvas) {
    try {
      const base64 = canvas.toDataURL("image/png");
      await fetch('http://localhost:3000/api/faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error("Error enviando al backend:", error);
    }
  }

  stopFaceDetection() {
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }
    if (this.videoEl) {
      this.videoEl.remove();
      this.videoEl = null;
    }
    if (this.canvasEl) {
      this.canvasEl.remove();
      this.canvasEl = null;
    }
  }

  attachEventListeners() {
    const autoDetection = document.getElementById('auto-detection');
    if (autoDetection) {
      autoDetection.addEventListener('change', (e) => {
        console.log("Auto-detection toggled:", e.target.checked);
      });
    }
  }

  initSessionTimer() {
    const sessionTimeElement = document.getElementById('session-time');
    if (!sessionTimeElement) {
      console.warn("Session time element not found.");
      return;
    }

    this.sessionStartTime = new Date();

    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }

    sessionTimeElement.textContent = '00:00:00';

    this.sessionTimer = setInterval(() => {
      const elapsed = new Date() - this.sessionStartTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');

      sessionTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);

    console.log("Session timer started.");
  }

  resetSession() {
    console.log("Resetting session timer...");
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    const sessionTimeElement = document.getElementById('session-time');
    if (sessionTimeElement) {
      sessionTimeElement.textContent = '00:00:00';
    }
    this.sessionStartTime = new Date();
    this.faceCount = 0;
    this.updateFaceCounter(0);
    console.log("Session timer reset.");
  }

  updateFaceCounter(count) {
    const counterElement = document.getElementById('counter');
    if (counterElement) {
      counterElement.textContent = count;
    }
  }

  destroy() {
    console.log("OverlayController destroying. Stopping timer and capture.");
    
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    
    this.stopFaceDetection();
    
    this.isActive = false;
    this.isRecording = false;
  }
}

window.OverlayController = OverlayController;