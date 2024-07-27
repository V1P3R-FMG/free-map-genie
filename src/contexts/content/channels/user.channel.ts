import { Channels } from "@constants";
import Channel from "@shared/channel";

class UserChannel {
    private readonly channel = Channel.window(Channels.Content);

    public async sendStartLogin() {
        return this.channel.send(Channels.Extension, {
            type: "start:login",
            data: window.location.href,
        });
    }

    public async sendLogin() {
        return this.channel.send(Channels.Extension, {
            type: "login",
        });
    }
}

export default new UserChannel();
