import storageChannel from "@content/channels/storage.channel";

export default class IframeStorageDriver implements Driver {
    public async has(key: string) {
        return storageChannel.has(key);
    }

    public async get(key: string) {
        return storageChannel.get(key);
    }

    public async set(key: string, value: string) {
        return storageChannel.set(key, value);
    }

    public async remove(key: string) {
        return storageChannel.remove(key);
    }

    public async keys() {
        return storageChannel.keys();
    }
}
