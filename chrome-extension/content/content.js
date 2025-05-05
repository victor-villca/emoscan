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
    isDragging = true;
    offsetX = e.clientX - overlay.getBoundingClientRect().left;
    offsetY = e.clientY - overlay.getBoundingClientRect().top;
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
  const actionButton = document.getElementById('action-button');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const actionText = document.getElementById('action-text');

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
}
initializeOverlay();