chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("meet.google.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        "js/face-api.min.js",
        "content/controllers/overlayController.js",
        "content/content.js"
      ]
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("Esta extensión solo funciona en Google Meet.")
    });
  }
});