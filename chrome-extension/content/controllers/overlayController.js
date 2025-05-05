class OverlayController {
    constructor() {
      this.overlay = null;
      this.isActive = false;
      this.sessionStartTime = null;
      this.sessionTimer = null;
    }

    init() {
      this.initSessionTimer();
      this.attachEventListeners();
    }
  
    
    attachEventListeners() {
      const autoDetection = document.getElementById('auto-detection');
      if (autoDetection) {
        autoDetection.addEventListener('change', (e) => {
        });
      }
    }

    initSessionTimer() {
      const sessionTimeElement = document.getElementById('session-time');
      if (!sessionTimeElement) return;
    
      this.sessionStartTime = new Date();
    
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer);
      }
    
      this.sessionTimer = setInterval(() => {
        const elapsed = new Date() - this.sessionStartTime;
        const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    
        sessionTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
      }, 1000);
    }
    
  
    
    updateFaceCounter(count) {
      const counterElement = document.getElementById('counter');
      if (counterElement) {
        counterElement.textContent = count;
        
      }
    }

    destroy() {
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer);
      }
    }
  }
  
window.OverlayController = OverlayController;
