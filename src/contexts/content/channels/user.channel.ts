import BaseChannel from "./base.channel";

class UserChannel extends BaseChannel {
    public async sendStartLogin(timeout?: number) {
        return this.sendBackground("start:login", { url: window.location.href }, timeout);
    }

    public async sendLogin(timeout?: number) {
        return this.sendBackground("login", {}, timeout);
    }
}

export default new UserChannel();
