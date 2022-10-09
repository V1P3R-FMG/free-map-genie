export default function send(action: string, data?: object, options = { all: false }): Promise<any> {
    let queryOptions = options.all && {} || { active: true, currentWindow: true };
    return new Promise((resolve) => {
        chrome.tabs.query(queryOptions, tabs => {
            Promise.all(tabs.map(tab => {
                return new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tab.id as number, { action, data }, (res) => {
                        var lastError = chrome.runtime.lastError;
                        if (lastError) {
                            reject(lastError);
                        } else {
                            resolve(res);
                        }
                    });
                }).catch((err) => {
                    return new Error(err);
                });
            })).then((results) => {
                if (queryOptions.active && queryOptions.currentWindow) {
                    resolve(results[0]);
                }
                resolve(results);
            })
        });
    });
}