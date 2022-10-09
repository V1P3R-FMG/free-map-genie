import options from "../options.json";

//Gets all options
export function getOptions() {
    return options;
}

//Gets stored extension settings
export function getSettings(): Promise<ExtensionSettings> {
    return new Promise(resolve => {
        chrome.storage.sync.get(["config"], (result) => {
            let config = Object.assign({}, ...options.map((option) => ({ [option.name]: option.default })), result.config || {});

            //Cleanup faulty keys
            for (let key in config) {
                if (key.match(/^\d+$/)) {
                    delete config[key];
                }
            }

            setSettings(config);
            resolve(config);
        });
    });
}

//Sets stored extension settings
export function setSettings(settings: { [key: string]: any }) {
    chrome.storage.sync.set({ config: settings });
}