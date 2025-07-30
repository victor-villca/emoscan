/**
 * EmoScan Chrome Extension - Main Content Script
 * 
 * This script manages the initialization and UI interaction for the EmoScan extension.
 * It handles session validation, overlay creation, and user interface management.
 * 
 * @fileoverview Main content script for EmoScan Chrome Extension
 * @version 1.0.0
 * @author EmoScan Extension Team
 */

/**
 * Initialize the overlay system by showing the session validation modal
 * 
 * @function initializeOverlay
 * @returns {void}
 */
function initializeOverlay() {
  showSessionModal();
}

/**
 * Create and display the session code validation modal
 * 
 * @function showSessionModal
 * @returns {void}
 */
function showSessionModal() {
  const modalHTML = `
    <div id="session-code-modal" class="modal-overlay">
      <div class="modal-content">
        <h3>Ingrese el código de sesión</h3>
        <input type="text" id="session-code-input" placeholder="Código de sesión" />
        <button id="validate-session-btn">Ingresar</button>
        <p id="session-error" style="color:red; display:none;">Código inválido</p>
      </div>
    </div>
  `;
  
  addStylesheet();
  
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);
  
  setupSessionValidation();
}

/**
 * Create the main overlay element with positioning and styling
 * 
 * @function createOverlay
 * @returns {HTMLElement} The created overlay element
 */
function createOverlay() {
  const existingOverlay = document.getElementById("custom-overlay");
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement("div");
  overlay.id = "custom-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "100px",
    right: "20px",
    zIndex: 9999,
    width: "300px",
    height: "450px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(5px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  });
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Add the extension's CSS stylesheet to the page
 * Prevents duplicate style loading
 * 
 * @function addStylesheet
 * @returns {void}
 */
function addStylesheet() {
  if (document.getElementById('emoscan-styles')) return;
  
  const style = document.createElement("link");
  style.id = 'emoscan-styles';
  style.rel = "stylesheet";
  style.href = chrome.runtime.getURL("ui/ui.css");
  document.head.appendChild(style);
}

/**
 * Make an overlay element draggable by the user
 * 
 * @function makeOverlayDraggable
 * @param {HTMLElement} overlay - The overlay element to make draggable
 * @returns {void}
 */
function makeOverlayDraggable(overlay) {
  let isDragging = false;
  let offsetX, offsetY;

  overlay.addEventListener("mousedown", (e) => {
    if (e.target !== overlay && !overlay.contains(e.target)) return;

    isDragging = true;
    offsetX = e.clientX - overlay.getBoundingClientRect().left;
    offsetY = e.clientY - overlay.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    overlay.style.left = `${e.clientX - offsetX}px`;
    overlay.style.top = `${e.clientY - offsetY}px`;
    overlay.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

/**
 * Load the HTML content for the overlay from the extension files
 * 
 * @function loadOverlayContent
 * @param {HTMLElement} overlay - The overlay element to populate with content
 * @returns {void}
 */
function loadOverlayContent(overlay) {
  fetch(chrome.runtime.getURL("ui/ui.html"))
    .then(response => response.text())
    .then(html => {
      overlay.innerHTML = html;
      makeOverlayDraggable(overlay);
      initializeUIHandlers();
    })
    .catch(error => {
      console.error('Error loading overlay content:', error);
    });
}

let controller;

/**
 * Initialize event handlers for the user interface elements
 * Sets up button clicks, toggles, and user interactions
 * 
 * @function initializeUIHandlers
 * @returns {void}
 */
function initializeUIHandlers() {
  const toggleButton = document.getElementById('toggle-visibility');
  const actionButton = document.getElementById('action-button');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const actionText = document.getElementById('action-text');
  const overlay = document.getElementById('custom-overlay');
  const resetButton = document.getElementById('reset-button');

  controller = new OverlayController();

  if (actionButton) {
    actionButton.addEventListener('click', async () => {
      const isActive = actionButton.classList.toggle('active');

      if (isActive) {
        try {
          statusDot.classList.add('active');
          statusText.textContent = 'Iniciando...';
          actionText.textContent = 'Iniciando...';
          actionButton.disabled = true;

          await controller.init();
          
          statusText.textContent = 'Activa';
          actionText.textContent = 'Detener Captura';
          actionButton.disabled = false;
          
        } catch (error) {
          console.error('Error starting capture:', error);
          
          actionButton.classList.remove('active');
          statusDot.classList.remove('active');
          statusText.textContent = 'Error';
          actionText.textContent = 'Iniciar Captura';
          actionButton.disabled = false;
        }
      } else {
        statusText.textContent = 'Deteniendo...';
        actionText.textContent = 'Deteniendo...';
        actionButton.disabled = true;
        
        controller.destroy();
        
        statusDot.classList.remove('active');
        statusText.textContent = 'Inactiva';
        actionText.textContent = 'Iniciar Captura';
        actionButton.disabled = false;
      }
    });
  }

  if (toggleButton && overlay) {
    toggleButton.addEventListener('click', () => {
      let restoreButton = document.getElementById('restore-visibility');

      if (!restoreButton) {
        restoreButton = document.createElement('button');
        restoreButton.id = 'restore-visibility';
        restoreButton.className = 'restore-visibility-button';
        const appIcon = document.createElement('img');
        appIcon.src = chrome.runtime.getURL('assets/icon.png');
        appIcon.alt = 'EmoScan';
        appIcon.style.width = '30px';
        appIcon.style.height = '30px';
        restoreButton.appendChild(appIcon);

        Object.assign(restoreButton.style, {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none'
        });
        
        makeDraggable(restoreButton);

        restoreButton.addEventListener('click', () => {
          const restoreButtonRect = restoreButton.getBoundingClientRect();
          overlay.style.position = 'fixed';
          overlay.style.left = `${restoreButtonRect.left - 300}px`;
          overlay.style.top = `${restoreButtonRect.top}px`;
          overlay.style.right = 'auto';
          overlay.style.display = 'block';
          restoreButton.remove();
        });

        document.body.appendChild(restoreButton);
      }
      overlay.style.display = 'none';
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (controller) {
        controller.resetSession();
      }
    });
  }
}

/**
 * Make any element draggable within the viewport
 * 
 * @function makeDraggable
 * @param {HTMLElement} element - The element to make draggable
 * @returns {void}
 */
function makeDraggable(element) {
  let isDragging = false;
  let offsetX, offsetY;

  element.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - offsetY}px`;
    element.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

/**
 * Set up session validation functionality for the modal
 * Handles user input, validation requests, and response processing
 * 
 * @function setupSessionValidation
 * @returns {void}
 */
function setupSessionValidation() {
  const modal = document.getElementById("session-code-modal");
  const input = document.getElementById("session-code-input");
  const button = document.getElementById("validate-session-btn");
  const errorText = document.getElementById("session-error");
  
  if (!modal || !input || !button || !errorText) {
    console.error('Modal elements not found');
    return;
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
      button.click();
    }
  });
  
  button.addEventListener("click", async () => {
    const code = input.value.trim();
    if (!code) {
      errorText.textContent = "Por favor ingrese un código";
      errorText.style.display = "block";
      return;
    }
    
    button.disabled = true;
    button.textContent = "Validando...";
    errorText.style.display = "none";
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`http://localhost:4000/api/sessions/validate/${code}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.valid) {
        window.sessionCode = code;
        window.sessionData = data.session;
        window.participantName = "anonymous";
        
        modal.remove();
        
        const overlay = createOverlay();
        loadOverlayContent(overlay);
        
      } else {
        errorText.textContent = data.message || "Código de sesión inválido";
        errorText.style.display = "block";
      }
    } catch (error) {
      console.error('Error validating session:', error);
      if (error.name === 'AbortError') {
        errorText.textContent = "Tiempo de espera agotado. Intenta de nuevo.";
      } else {
        errorText.textContent = "Error de conexión. Verifica que el servidor esté funcionando.";
      }
      errorText.style.display = "block";
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });
  
  setTimeout(() => input.focus(), 100);
}

/**
 * Clean up resources when the page is about to unload
 * Ensures proper cleanup of the controller and its resources
 * 
 * @event beforeunload
 * @returns {void}
 */
window.addEventListener('beforeunload', () => {
  if (window.controller) {
    window.controller.destroy();
  }
});

/**
 * Initialize the extension when the page loads
 * Handles both immediate loading and deferred loading scenarios
 * 
 * @event DOMContentLoaded
 * @returns {void}
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
  initializeOverlay();
}