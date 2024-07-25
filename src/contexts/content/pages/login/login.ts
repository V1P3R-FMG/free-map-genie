import { Channels, FmgMockedUserKey } from "@constants";
import Channel from "@shared/channel";

function createSpace(): JQuery<HTMLDivElement> {
    return $<HTMLDivElement>("<div/>").css({
        padding: "0 15px",
    });
}

function createMockUserButton(): JQuery<HTMLButtonElement> {
    return $<HTMLButtonElement>("<button/>")
        .text("Mock User")
        .addClass("btn btn-outline-secondary")
        .attr("type", "button")
        .on("click", () => {
            window.localStorage.setItem(FmgMockedUserKey, "1");

            Channel.window(Channels.Content).send(Channels.Extension, {
                type: "login",
            });
        });
}

async function attachButton() {
    await document.waitForDocumentBody();

    $(`form button[type="submit"]`)
        .parent()
        .append(createSpace())
        .append(createMockUserButton());
}

export default async function main() {
    window.localStorage.removeItem(FmgMockedUserKey);
    await attachButton();
}
