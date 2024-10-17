import { sendMessage } from "@shared/channel/popup";

class ExtensionChannel {
    public async getPageType(timeout?: number) {
        return sendMessage("background", "get:page:type", { url: window.location.href }, timeout);
    }

    public async login(timeout?: number) {
        return sendMessage("background", "login", {}, timeout);
    }
}

export default new ExtensionChannel();
