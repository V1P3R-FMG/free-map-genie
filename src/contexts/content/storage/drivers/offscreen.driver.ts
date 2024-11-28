import channel from "@shared/channel/content";

export default class OffscreenStorageDriver implements Driver {
    public async has(key: string) {
        return channel.offscreen.has({ key });
    }

    public async get(key: string) {
        return channel.offscreen.get({ key });
    }

    public async set(key: string, value: string) {
        return channel.offscreen.set({ key, value });
    }

    public async remove(key: string) {
        return channel.offscreen.remove({ key });
    }

    public async keys() {
        return channel.offscreen.keys();
    }
}
