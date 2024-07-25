import { Channels } from "@constants";
import Channel from "@shared/channel";
import validate from "@shared/validation";
import runContexts from "@shared/run";

const MESSAGE_SCHEME = validate.validator({ type: "string", data: "any" });
const KEY_SCHEME = validate.validator({ key: "string" });
const KEY_VALUE_SCHEME = validate.validator({ key: "string", value: "string" });

async function main() {
    const origin = new URLSearchParams(window.location.search).get("origin");

    logger.debug("Localstorage script is loaded by origin:", origin);

    const channel = Channel.extension(
        Channels.Mapgenie,
        (message, sendResponse) => {
            const { type, data } = MESSAGE_SCHEME(message);
            switch (type) {
                case "has": {
                    const { key } = KEY_SCHEME(data);
                    sendResponse(window.localStorage.getItem(key) != null);
                }
                case "get": {
                    const { key } = KEY_SCHEME(data);
                    sendResponse(window.localStorage.getItem(key));
                    return true;
                }
                case "set": {
                    const { key, value } = KEY_VALUE_SCHEME(data);
                    window.localStorage.setItem(key, value);
                    return false;
                }
                case "remove": {
                    const { key } = KEY_SCHEME(data);
                    window.localStorage.removeItem(key);
                    return false;
                }
                case "keys": {
                    sendResponse(Object.keys(window.localStorage));
                    return true;
                }
                default:
                    return false;
            }
        }
    );

    if (origin) channel.allowOrigin(origin);
}

runContexts("iframe", main);
