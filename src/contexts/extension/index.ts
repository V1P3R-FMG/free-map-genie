import Channel from "@shared/channel";
import { Channels } from "@constants";
import validation from "@shared/validation";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";
import AdBlocker from "./ads";

const MESSAGE_SCHEME = validation.scheme({ type: "string", data: "any" });

function createFrame(): HTMLIFrameElement {
    logger.debug("Create Frame");
    return $<HTMLIFrameElement>("<iframe/>")
        .attr({
            id: "mapgenie-storage",
            src: `https://mapgenie.io/?origin=${window.location.origin}`,
            width: 0,
            height: 0,
            marginwidth: 0,
            marginheight: 0,
            hspace: 0,
            vspace: 0,
            frameborder: 0,
            scrolling: "no",
            "aria-hidden": true,
        })
        .appendTo(document.body)
        .get(0)!;
}

function getFrame(): HTMLIFrameElement {
    const iframe = $<HTMLIFrameElement>("#mapgenie-storage");
    return iframe.length > 0 ? iframe.get(0)! : createFrame();
}

async function main() {
    const _ = Channel.window(
        Channels.Extension,
        (message, sendResponse, _sendError) => {
            const { type } = validation.check(MESSAGE_SCHEME, message);

            switch (type) {
                case "hello":
                    sendResponse("Hello from extension.js");
                    return true;
                default:
                    return false;
            }
        }
    );

    const channel = Channel.extension(Channels.Extension);
    channel.allowOrigin("https://mapgenie.io");

    await document.waitForDocumentBody();
    const _iframe = getFrame();

    await channel.send(Channels.Mapgenie, {
        type: "set",
        data: { key: "hello", value: "world" },
    });

    logger.debug(
        "Mapgenie Iframe Send data for key 'hello'",
        await channel.send(Channels.Mapgenie, {
            type: "get",
            data: { key: "hello" },
        })
    );

    injectExtensionScript("content.js");

    // AdBlocker.onTick(logger.debug.bind("FMG AdBlocker stats:"));
    AdBlocker.start();
    AdBlocker.removePrivacyPopup();
}

runContexts("extension", main);
