import { Channels } from "@constants";
import ChannelClass from "@shared/channel";

class Channel {
    private readonly channel = ChannelClass.window(Channels.Content);

    public async sendLogin() {
        return this.channel.send(Channels.Extension, {
            type: "login",
        });
    }
}

export default new Channel();
