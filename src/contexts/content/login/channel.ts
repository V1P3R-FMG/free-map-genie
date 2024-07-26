import { Channels } from "@constants";
import Channel from "@shared/channel";

class LoginChannel {
    private readonly channel = Channel.window(Channels.Content);

    public async sendLogin() {
        return this.channel.send(Channels.Extension, {
            type: "login",
        });
    }
}

export default new LoginChannel();
