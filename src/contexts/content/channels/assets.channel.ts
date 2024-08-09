import BaseChannel from "./base.channel";

class AssetsChannel extends BaseChannel {
    public async getAsset(path: string): Promise<string> {
        return this.sendExtension({ type: "asset", data: path });
    }

    public async injectStyle(path: string): Promise<string> {
        return this.sendExtension({ type: "inject:style", data: path });
    }
}

export default new AssetsChannel();
