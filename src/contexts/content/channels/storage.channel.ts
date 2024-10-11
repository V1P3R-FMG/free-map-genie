import BaseChannel from "./base.channel";

class StorageChannel extends BaseChannel {
    public async has(key: string, timeout?: number) {
        return this.sendOffscreen("has", { key }, timeout);
    }

    public async get(key: string, timeout?: number) {
        return this.sendOffscreen("get", { key }, timeout);
    }

    public async set(key: string, value: string, timeout?: number) {
        return this.sendOffscreen("set", { key, value }, timeout);
    }

    public async remove(key: string, timeout?: number) {
        return this.sendOffscreen("remove", { key }, timeout);
    }

    public async keys(timeout?: number) {
        return this.sendOffscreen("keys", {}, timeout);
    }
}

export default new StorageChannel();
