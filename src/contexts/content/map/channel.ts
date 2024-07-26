import { Channels } from "@constants";
import ChannelClass from "@shared/channel";

class Channel {
    private readonly channel = ChannelClass.window(Channels.Content);

    public async sendStartLogin() {
        return this.channel.send(Channels.Extension, {
            type: "start:login",
            data: window.location.href,
        });
    }
}

export default new Channel();
