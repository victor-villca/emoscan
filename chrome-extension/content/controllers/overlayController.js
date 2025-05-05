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
    this.isActive = true;
    console.log("OverlayController initialized. Session timer started.");
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
       console.log("Session timer reset.");
  }


  updateFaceCounter(count) {
    const counterElement = document.getElementById('counter');
    if (counterElement) {
      counterElement.textContent = count;
    }
  }

  destroy() {
     console.log("OverlayController destroying. Stopping timer.");
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.isActive = false;
  }
}

window.OverlayController = OverlayController;