import { Channels } from "@constants";
import Channel from "@shared/channel";

class StorageChannel {
    private readonly channel = Channel.window(Channels.Content);

    public async has(key: string): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "has",
            data: { key },
        });
    }

    public async get(key: string): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "get",
            data: { key },
        });
    }

    public async set(key: string, value: string): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "set",
            data: { key, value },
        });
    }

    public async remove(key: string): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "remove",
            data: { key },
        });
    }

    public async keys(): Promise<string> {
        return this.channel.send(Channels.Extension, {
            type: "keys",
        });
    }
}

export default new StorageChannel();
