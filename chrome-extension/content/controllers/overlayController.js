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
if (typeof OverlayController === 'undefined') {

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
  this.analysisInterval = null;
  this.isCapturing = false;
  this.lastSend = 0;
  this.faceCount = 0;
  this.SEND_INTERVAL = 3000;
  this.FACE_SIZE = 48;
  this.IMAGE_QUALITY = 0.8;
  this.knownParticipants = new Map();
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
    await this.loadModels();
    this.startIndividualParticipantAnalysis();
    console.log("OverlayController initialized. Session timer started.");
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
    console.log("Face API models loaded");
  } catch (error) {
    console.error("Error loading Face API models:", error);
    throw error;
  }
}

/**
 * Start the individual face detection through Meet structure
 * 
 * @async
 * @method startIndividualParticipantAnalysis
 * @returns {Promise<void>} Promise that resolves when detecting the emotions
 * @throws {Error} Throws error if screen capture fails to start
 */
 startIndividualParticipantAnalysis() {
    if (!window.sessionCode) {
      console.error("No session code available");
      return;
    }
    
    this.isCapturing = true;
    const lastSentTimestamps = new Map();

    this.analysisInterval = setInterval(async () => {
      if (!this.isCapturing) return;

      const participantContainers = document.querySelectorAll('div[data-participant-id]');
      let currentParticipantsInCall = new Map();
      
      for (const container of participantContainers) {
        let participantName = null;
        try {
            const nameElement = container.querySelector('.OFfHfd .notranslate'); 
            if (nameElement && nameElement.textContent) {
            participantName = nameElement.textContent.trim();
          }
        } catch (e) {
          console.warn("Could not extract participant name, falling back to default:", e);
        }

        if (!participantName) continue;
        
        const videoElement = container.querySelector('video:not([style*="display: none"])');
        const hasVideo = videoElement && 
                        videoElement.readyState >= 2 && 
                        videoElement.videoWidth > 0 &&
                        videoElement.videoHeight > 0 &&
                        !videoElement.paused &&
                        videoElement.offsetWidth > 0;
      
        currentParticipantsInCall.set(participantName, {
          status: hasVideo ? 'active_with_video' : 'active_no_video',
          videoElement: hasVideo ? videoElement : null,
        });
      }
      
      this.knownParticipants.forEach((data, name) => {
          if (!currentParticipantsInCall.has(name) && data.status !== 'left') {
              currentParticipantsInCall.set(name, { status: 'left', videoElement: null });
          }
      });

      await this.updateAndSendParticipantStatus(currentParticipantsInCall);
      
      const activeVideoCount = Array.from(currentParticipantsInCall.values())
        .filter(p => p.status === 'active_with_video').length;
      this.updateFaceCounter(activeVideoCount);
      
      for (const [participantName, data] of currentParticipantsInCall.entries()) {
        if (data.status !== 'active_with_video') continue;
        
        const now = Date.now();
        if (now - (lastSentTimestamps.get(participantName) || 0) < this.SEND_INTERVAL) {
          continue;
        }

        try {
          const videoEl = data.videoElement;
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          
          const detection = await faceapi.detectSingleFace(
            canvas,  
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          );

          if (detection) {
            if (participantName !== 'Unknown Participant' && !participantName.startsWith('Participant_')) {
              lastSentTimestamps.set(participantName, now);            
              const faceCanvases = await faceapi.extractFaces(canvas, [detection]);
              if (faceCanvases.length > 0) {
                const aiFormattedCanvas = this.convertToAIFormat(faceCanvases[0]);
                
                console.log(`Processing participant: "${participantName}" (${videoEl.videoWidth}x${videoEl.videoHeight})`);
                await this.sendFaceToBackend(aiFormattedCanvas, window.sessionCode, participantName);
              }
            } else {
              console.log(`Skipping send for default/unidentified participant: "${participantName}"`);
            }
          }
        } catch (error) {
          console.error(`Error processing video for participant "${participantName}":`, error);
        }
      }
    }, 2500);
  }


  /**
 * Updates and sends participant status changes to the backend server
 * Only sends updates when there are actual changes in participant states
 * 
 * @method updateAndSendParticipantStatus
 * @param {Map} currentParticipants - Map of current participants with their status and video elements
 *                                   Key: participant name, Value: {status: string, videoElement: HTMLVideoElement|null}
 * @returns {Promise<void>} Resolves when status update is sent or skipped
 */
async updateAndSendParticipantStatus(currentParticipants) {
    const newStatusPayload = Array.from(currentParticipants.entries()).map(([name, data]) => ({ name, status: data.status }));
    const oldStatusPayload = Array.from(this.knownParticipants.entries()).map(([name, data]) => ({ name, status: data.status }));
    if (JSON.stringify(newStatusPayload.sort((a, b) => a.name.localeCompare(b.name))) === JSON.stringify(oldStatusPayload.sort((a, b) => a.name.localeCompare(b.name)))) {
        return;
    }
    
    this.knownParticipants = currentParticipants;
    try {
      await fetch('http://localhost:4000/api/sessions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: window.sessionCode,
          participants: newStatusPayload,
        }),
      });
      console.log("✅ Participant status update sent.", newStatusPayload);
    } catch (error) {
      console.error("Failed to send status update:", error);
      window.dispatchEvent(new CustomEvent('backendError', { detail: { message: 'Connection lost. Status not updated.' } }));
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
    console.log(`Sending AI-optimized face data - ${canvas.width}x${canvas.height}, grayscale, ~${sizeKB}KB`);
    

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
    console.log("AI-optimized face data sent successfully:", result);
    
  } catch (error) {
    console.error("Error sending to backend:", error);
    window.dispatchEvent(new CustomEvent('backendError', { detail: { message: 'Connection lost. Analysis paused.' } }));
    
    if (error.name === 'AbortError') {
      console.log("Request timed out");
    } else if (error.message.includes('413')) {
      console.log("Payload too large (unusual for 48x48 images)");
    } else if (error.message.includes('500')) {
      console.log("Server error - check backend logs");
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
  console.log("Stopping capture...");
  
  this.isCapturing = false;
  this.faceCount = 0;
  if (this.analysisInterval) {
    clearInterval(this.analysisInterval);
    this.analysisInterval = null;
  }
  
  console.log("Capture stopped successfully");
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
      console.log("Auto-detection toggled:", e.target.checked);
      if (e.target.checked && !this.analysisInterval && this.isCapturing) {
        this.startIndividualParticipantAnalysis();
      } else if (!e.target.checked && this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = null;
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

  console.log("Session timer started.");
}

/**
 * Reset the session timer and face counter to initial values
 * 
 * @method resetSession
 * @returns {void}
 */
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
  
  this.knownParticipants.clear();
  
  console.log("Session timer reset.");
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
  console.log("OverlayController destroying. Stopping timer and capture.");
  const sessionTimeElement = document.getElementById('session-time');
  if (sessionTimeElement) {
    sessionTimeElement.textContent = '00:00:00';
  }
  if (this.sessionTimer) {
    clearInterval(this.sessionTimer);
    this.sessionTimer = null;
  }
  
  this.stopCapture();
  
  this.isActive = false;
  this.knownParticipants.clear();
}
}

window.OverlayController = OverlayController;
}