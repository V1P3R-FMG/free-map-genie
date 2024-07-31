import BaseChannel from "./base.channel";

class StorageChannel extends BaseChannel {
    public async has(key: string): Promise<boolean> {
        return this.sendIframe({ type: "has", data: { key } });
    }

    public async get(key: string): Promise<string> {
        return this.sendIframe({ type: "get", data: { key } });
    }

    public async set(key: string, value: string): Promise<void> {
        return this.sendIframe({ type: "set", data: { key, value } });
    }

    public async remove(key: string): Promise<void> {
        return this.sendIframe({ type: "remove", data: { key } });
    }

    public async keys(): Promise<string[]> {
        return this.sendIframe({ type: "keys", data: undefined });
    }
}

export default new StorageChannel();
