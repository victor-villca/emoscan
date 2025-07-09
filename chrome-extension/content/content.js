function initializeOverlay() {
  const overlay = createOverlay();
  addStylesheet();
  loadOverlayContent(overlay);
}

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

function addStylesheet() {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = chrome.runtime.getURL("ui/ui.css");
  document.head.appendChild(style);
}

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

function loadOverlayContent(overlay) {
  fetch(chrome.runtime.getURL("ui/ui.html"))
    .then(response => response.text())
    .then(html => {
      overlay.innerHTML = html;
      makeOverlayDraggable(overlay);
      initializeUIHandlers();
    });
}

let controller;
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
    actionButton.addEventListener('click', () => {
      const isActive = actionButton.classList.toggle('active');

      if (isActive) {
        statusDot.classList.add('active');
        statusText.textContent = 'Activa';
        actionText.textContent = 'Detener Captura';
        controller.init();
      } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'Inactiva';
        actionText.textContent = 'Iniciar Captura';
        controller.destroy();
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
       controller.resetSession();
     });
   }
}

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


initializeOverlay();