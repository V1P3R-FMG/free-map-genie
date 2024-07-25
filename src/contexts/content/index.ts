import Channel from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";
import Games from "@fmg/api/games";

import initPage from "./pages/index";

async function main() {
    const _channel = Channel.window(Channels.Content);

    Games.getGame(1).then(logger.debug);
}

runContexts("content", initPage, main);
