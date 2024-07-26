import { Channels } from "@constants";
import Channel from "@shared/channel";

class MapChannel {
    private readonly channel = Channel.window(Channels.Content);

    public async sendStartLogin() {
        return this.channel.send(Channels.Extension, {
            type: "start:login",
            data: window.location.href,
        });
    }
}

export default new MapChannel();
