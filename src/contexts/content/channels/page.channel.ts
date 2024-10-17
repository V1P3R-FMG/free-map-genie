import BaseChannel from "./base.channel";

class GamesChannel extends BaseChannel {
    public async getPageType() {
        return this.sendBackground("get:page:type", { url: window.location.href });
    }
}

export default new GamesChannel();
