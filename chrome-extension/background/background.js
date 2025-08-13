chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.includes('meet.google.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => alert("Esta extensión solo funciona en Google Meet.")
        });
        return;
    }

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                return {
                    hasEmoScan: typeof window.emoScanInitialized !== 'undefined',
                    hasOverlayController: typeof OverlayController !== 'undefined',
                    hasFaceApi: typeof faceapi !== 'undefined'
                };
            }
        });

        const { hasEmoScan, hasOverlayController, hasFaceApi } = results[0].result;

        if (hasEmoScan && hasOverlayController && hasFaceApi) {
            console.log('Scripts already loaded, showing session modal');
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const existingModal = document.getElementById("session-code-modal");
                    if (existingModal) {
                        existingModal.remove();
                    }
                    
                    if (typeof showSessionModal !== 'undefined') {
                        showSessionModal();
                    } else {
                        console.error('showSessionModal function not available');
                        if (typeof initializeOverlay !== 'undefined') {
                            initializeOverlay();
                        }
                    }
                }
            });
            return;
        }

        console.log('Injecting EmoScan scripts...');
        
        const scriptsToInject = [
            "js/face-api.min.js",
            "content/controllers/overlayController.js",
            "content/content.js"
        ];

        for (const script of scriptsToInject) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: [script]
                });
                console.log(`Successfully injected: ${script}`);
            } catch (error) {
                console.error(`Error injecting ${script}:`, error);
                throw error;
            }
        }

        console.log('EmoScan extension scripts injected successfully');
        
    } catch (error) {
        console.error('Error with EmoScan extension:', error);
        
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (errorMsg) => {
                alert(`Error al cargar EmoScan: ${errorMsg}\n\nPor favor, recarga la página e intenta de nuevo.`);
            },
            args: [error.message]
        });
    }
});