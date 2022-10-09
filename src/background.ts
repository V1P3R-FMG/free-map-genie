const RETRY_TIME_INTERVAL_MS = 500;

function checkErrors() {
    // const lastError = chrome.runtime.lastError;
    // if (lastError) {
    //     console.log("Error: ", lastError);
    // }
}

async function connectToWebSocket(port: number): Promise<WebSocket> {
    return new Promise(async (resolve, reject) => {
        try {
            const ws = new WebSocket(`ws://localhost:${port}/ws`);
    
            ws.onopen = function() {
                console.log(`Connected to websocket ws://localhost:${port}/ws`);
            }
    
            ws.onmessage = function(webSocketMessage) {
                const messageObject = JSON.parse(webSocketMessage.data);
                const message = messageObject.message;
                // const data = messageObject.data;
                switch(message) {
                    case "reload":
                        const action = "reload_window";
                        
                        // console.log("Reload tabs");

                        chrome.tabs.query({}, function(tabs) {
                            Promise.all(tabs.map(tab => {
                                return new Promise(resolve => {
                                    if (tab.id) {
                                        chrome.tabs.sendMessage(tab.id, {action}, () => {
                                            checkErrors();
                                            resolve(void 0);
                                        });
                                    } else {
                                        resolve(void 0);
                                    }
                                });//
                            }))
                            .then(() => {
                                // console.log("Reload extension");
                                chrome.runtime.reload();
                            });
                        });
                        break;
                }
            }
    
            ws.onclose = () => connectToWebSocket(port);
    
            resolve(ws);
        } catch (e) {
            reject();
			setTimeout(() => connectToWebSocket(port), RETRY_TIME_INTERVAL_MS);
        }
    })
}


fetch(chrome.runtime.getURL("settings.json"))
	.then(res => res.json())
	.then(settings => {
		if (settings.debug && settings.watch) {
			console.log("MapGenieProUnlock running in dev mode.");
			connectToWebSocket(settings.wss.port).then();
		}
	});