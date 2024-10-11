import BaseChannel from "./base.channel";

class AssetsChannel extends BaseChannel {
    public async getAsset(path: string, timeout?: number) {
        return this.sendExtension("asset", { path }, timeout);
    }

    public async injectStyle(path: string, timeout?: number) {
        return this.sendExtension("inject:style", { path }, timeout);
    }
}

export default new AssetsChannel();
