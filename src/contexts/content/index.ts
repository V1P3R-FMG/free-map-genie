import Channel from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";
import initPage from "./pages/index";

async function main() {
    const _channel = Channel.window(Channels.Content);
}

runContexts("content", initPage, main);
