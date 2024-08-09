import BaseChannel from "./base.channel";

class UserChannel extends BaseChannel {
    public async sendStartLogin() {
        return this.sendBackground({ type: "start:login", data: window.location.href });
    }

    public async sendLogin() {
        return this.sendBackground({ type: "login", data: undefined });
    }
}

export default new UserChannel();
