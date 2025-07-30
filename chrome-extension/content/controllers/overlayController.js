/**
 * OverlayController - Manages face detection and screen capture for emotion analysis
 * 
 * This class handles the main functionality of capturing screen content, detecting faces,
 * processing them for AI analysis, and sending the data to a backend server.
 * 
 * @class OverlayController
 * @version 1.0.0
 * @author EmoScan Extension
 */
class OverlayController {
  /**
   * Initialize the OverlayController with default configuration
   * 
   * @constructor
   */
  constructor() {
    this.overlay = null;
    this.isActive = false;
    this.sessionStartTime = null;
    this.sessionTimer = null;
    this.stream = null;
    this.videoEl = null;
    this.canvasEl = null;
    this.faceDetectionInterval = null;
    this.isCapturing = false;
    this.lastSend = 0;
    this.faceCount = 0;
    this.SEND_INTERVAL = 2000;
    this.FACE_SIZE = 48;
    this.IMAGE_QUALITY = 0.8;
  }

  /**
   * Initialize the overlay controller and start all necessary processes
   * 
   * @async
   * @method init
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   * @throws {Error} Throws error if initialization fails
   */
  async init() {
    try {
      this.initSessionTimer();
      this.attachEventListeners();
      this.isActive = true;
      await this.startScreenCapture();
      // console.log("OverlayController initialized. Session timer started.");
    } catch (error) {
      console.error("Error initializing OverlayController:", error);
      alert("Error al inicializar: " + error.message);
    }
  }

  /**
   * Load Face API models required for face detection
   * 
   * @async
   * @method loadModels
   * @returns {Promise<void>} Promise that resolves when models are loaded
   * @throws {Error} Throws error if models fail to load
   */
  async loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(chrome.runtime.getURL('js/models'));
      // console.log("Face API models loaded");
    } catch (error) {
      console.error("Error loading Face API models:", error);
      throw error;
    }
  }

  /**
   * Start screen capture and initialize video processing elements
   * 
   * @async
   * @method startScreenCapture
   * @returns {Promise<void>} Promise that resolves when screen capture starts
   * @throws {Error} Throws error if screen capture fails to start
   */
  async startScreenCapture() {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: "always",
          mediaSource: "screen"
        },
        audio: false
      });

      this.videoEl = document.createElement("video");
      this.videoEl.srcObject = this.stream;
      this.videoEl.style.display = "none";
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      document.body.appendChild(this.videoEl);

      await new Promise((resolve, reject) => {
        this.videoEl.onloadedmetadata = () => {
          this.videoEl.play()
            .then(resolve)
            .catch(reject);
        };
        this.videoEl.onerror = reject;
      });

      this.canvasEl = document.createElement("canvas");
      this.canvasEl.style.display = "none";
      document.body.appendChild(this.canvasEl);

      this.canvasEl.width = this.videoEl.videoWidth || 1280;
      this.canvasEl.height = this.videoEl.videoHeight || 720;

      // console.log(`Canvas size: ${this.canvasEl.width}x${this.canvasEl.height}`);

      await this.loadModels();

      this.isCapturing = true;
      this.startFaceDetection();

      this.stream.getVideoTracks()[0].addEventListener("ended", () => {
        // console.log("Screen sharing stopped");
        this.stopCapture();
      });

    } catch (err) {
      console.error("Error starting screen capture:", err);
      if (err.name === 'NotAllowedError') {
        alert("Permiso de pantalla denegado. Por favor, permite el acceso a la pantalla.");
      } else {
        alert("Error al iniciar la captura de pantalla: " + err.message);
      }
      throw err;
    }
  }

  /**
   * Convert original face image to 48x48 grayscale format optimized for AI analysis
   * 
   * @method convertToAIFormat
   * @param {HTMLCanvasElement} originalCanvas - The original face canvas to convert
   * @returns {HTMLCanvasElement} Canvas with 48x48 grayscale image optimized for AI
   */
  convertToAIFormat(originalCanvas) {
    try {
      const aiCanvas = document.createElement("canvas");
      aiCanvas.width = this.FACE_SIZE;
      aiCanvas.height = this.FACE_SIZE;
      
      const ctx = aiCanvas.getContext("2d", { willReadFrequently: true });
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(originalCanvas, 0, 0, this.FACE_SIZE, this.FACE_SIZE);
      
      const imageData = ctx.getImageData(0, 0, this.FACE_SIZE, this.FACE_SIZE);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(
          data[i] * 0.299 +
          data[i + 1] * 0.587 +
          data[i + 2] * 0.114
        );
        
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      
      this.enhanceContrast(data);
      
      ctx.putImageData(imageData, 0, 0);
      
      return aiCanvas;
    } catch (error) {
      console.error("Error converting to AI format:", error);
      return originalCanvas;
    }
  }

  /**
   * Enhance contrast of image data to preserve facial features in low resolution
   * 
   * @method enhanceContrast
   * @param {Uint8ClampedArray} data - Image pixel data array
   * @param {number} [factor=1.1] - Contrast enhancement factor
   */
  enhanceContrast(data, factor = 1.1) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
    }
  }

  /**
   * Start the face detection process with interval-based execution
   * 
   * @method startFaceDetection
   * @returns {void}
   */
  startFaceDetection() {
    const sessionCode = window.sessionCode;
    const participantName = window.participantName;
    
    if (!sessionCode) {
      console.error("No session code available");
      return;
    }

    // console.log("Starting face detection...");

    this.faceDetectionInterval = setInterval(async () => {
      if (!this.isCapturing || !this.videoEl || this.videoEl.readyState < 2) {
        return;
      }

      try {
        const ctx = this.canvasEl.getContext("2d", { willReadFrequently: true });
        
        ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        
        ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
        
        const detections = await faceapi.detectAllFaces(
          this.canvasEl, 
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
          })
        );
        
        // console.log("Faces detected:", detections.length);
        
        this.faceCount += detections.length;
        this.updateFaceCounter(this.faceCount);

        const facesToProcess = detections.slice(0, 2);
        
        for (let i = 0; i < facesToProcess.length; i++) {
          const box = facesToProcess[i].box;

          if (box.width < 32 || box.height < 32) {
            continue;
          }

          const padding = Math.min(box.width * 0.1, box.height * 0.1);
          const extractX = Math.max(0, box.x - padding);
          const extractY = Math.max(0, box.y - padding);
          const extractWidth = Math.min(this.canvasEl.width - extractX, box.width + 2 * padding);
          const extractHeight = Math.min(this.canvasEl.height - extractY, box.height + 2 * padding);

          const faceCanvas = document.createElement("canvas");
          faceCanvas.width = extractWidth;
          faceCanvas.height = extractHeight;

          const faceCtx = faceCanvas.getContext("2d");
          faceCtx.drawImage(
            this.canvasEl, 
            extractX, extractY, extractWidth, extractHeight, 
            0, 0, extractWidth, extractHeight
          );

          if (Date.now() - this.lastSend > this.SEND_INTERVAL) {
            this.lastSend = Date.now();
            const aiFormattedCanvas = this.convertToAIFormat(faceCanvas);
            await this.sendFaceToBackend(aiFormattedCanvas, sessionCode, participantName);
            break;
          }
        }
      } catch (error) {
        console.error("Error in face detection:", error);
      }
    }, this.SEND_INTERVAL);
  }

  /**
   * Send processed face data to the backend server for analysis
   * 
   * @async
   * @method sendFaceToBackend
   * @param {HTMLCanvasElement} canvas - Canvas containing the processed face image
   * @param {string} code - Session code for identification
   * @param {string} participantName - Name of the participant
   * @returns {Promise<void>} Promise that resolves when data is sent successfully
   */
  async sendFaceToBackend(canvas, code, participantName) {
    try {
      const base64 = canvas.toDataURL("image/jpeg", this.IMAGE_QUALITY);
      const payload = {
        code,
        participantName,
        timestamp: new Date().toISOString(),
        image: base64,
        format: {
          width: canvas.width,
          height: canvas.height,
          colorspace: "grayscale",
          optimizedForAI: true
        }
      };
      
      const sizeKB = Math.round((base64.length * 0.75) / 1024);
      // console.log(`Sending AI-optimized face data - ${canvas.width}x${canvas.height}, grayscale, ~${sizeKB}KB`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('http://localhost:4000/api/emotions/ingest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      // console.log("AI-optimized face data sent successfully:", result);
      
    } catch (error) {
      console.error("Error sending to backend:", error);
      
      if (error.name === 'AbortError') {
        // console.log("Request timed out");
      } else if (error.message.includes('413')) {
        // console.log("Payload too large (unusual for 48x48 images)");
      } else if (error.message.includes('500')) {
        // console.log("Server error - check backend logs");
      }
    }
  }

  /**
   * Stop all capture processes and clean up resources
   * 
   * @method stopCapture
   * @returns {void}
   */
  stopCapture() {
    // console.log("Stopping capture...");
    
    this.isCapturing = false;
    this.faceCount = 0;
    
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        // console.log(`Stopped track: ${track.kind}`);
      });
      this.stream = null;
    }
    
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl.remove();
      this.videoEl = null;
    }
    
    if (this.canvasEl) {
      this.canvasEl.remove();
      this.canvasEl = null;
    }
    
    // console.log("Capture stopped successfully");
  }

  /**
   * Attach event listeners to UI elements for user interaction
   * 
   * @method attachEventListeners
   * @returns {void}
   */
  attachEventListeners() {
    const autoDetection = document.getElementById('auto-detection');
    if (autoDetection) {
      autoDetection.addEventListener('change', (e) => {
        // console.log("Auto-detection toggled:", e.target.checked);
        if (e.target.checked && !this.faceDetectionInterval && this.isCapturing) {
          this.startFaceDetection();
        } else if (!e.target.checked && this.faceDetectionInterval) {
          clearInterval(this.faceDetectionInterval);
          this.faceDetectionInterval = null;
        }
      });
    }
  }

  /**
   * Initialize and start the session timer for tracking session duration
   * 
   * @method initSessionTimer
   * @returns {void}
   */
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

    // console.log("Session timer started.");
  }

  /**
   * Reset the session timer and face counter to initial values
   * 
   * @method resetSession
   * @returns {void}
   */
  resetSession() {
    // console.log("Resetting session timer...");
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
    // console.log("Session timer reset.");
  }

  /**
   * Update the face counter display in the UI
   * 
   * @method updateFaceCounter
   * @param {number} count - Current face count to display
   * @returns {void}
   */
  updateFaceCounter(count) {
    const counterElement = document.getElementById('counter');
    if (counterElement) {
      counterElement.textContent = count;
    }
  }

  /**
   * Destroy the controller and clean up all resources
   * 
   * @method destroy
   * @returns {void}
   */
  destroy() {
    // console.log("OverlayController destroying. Stopping timer and capture.");
    
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    this.stopCapture();
    
    this.isActive = false;
  }
}

window.OverlayController = OverlayController;