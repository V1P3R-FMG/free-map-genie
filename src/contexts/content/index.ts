import Channel from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";

async function main() {
    const channel = Channel.window(Channels.Content);

    logger.debug(await channel.send(Channels.Extension, { type: "hello" }));
}

runContexts("content", main);
