import BaseChannel from "./index";

class UserChannel extends BaseChannel {
    public async sendStartLogin() {
        return this.sendExtension({ type: "start:login", data: window.location.href });
    }

    public async sendLogin() {
        return this.sendExtension({ type: "login", data: undefined });
    }
}

export default new UserChannel();
