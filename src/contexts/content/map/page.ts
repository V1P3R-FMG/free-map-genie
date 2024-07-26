import Data from "./data";
import Channel from "./channel";

class Page {
    public async addMockUserButton(): JQueryAsync<HTMLAnchorElement> {
        const features = await $.waitFor("#user-panel .features");
        return $<HTMLAnchorElement>("<a/>")
            .text("Mock User")
            .addClass("btn btn-outline-secondary")
            .attr("href", window.location.href)
            .on("click", () => {
                Data.enableMockUser(true);
                window.location.reload();
            })
            .insertBefore(features);
    }

    public async initLoginButton() {
        const btn = await $.waitFor<HTMLAnchorElement>(`#user-panel a[href$="/login"]`, { message: "No login button" });
        btn.on("click", () => Channel.sendStartLogin());
    }

    public async initLogoutButton() {
        const btn = await $.waitFor<HTMLAnchorElement>(`.logout a[href$="/logout"]`, { message: "No logout button" });
        btn.on("click", () => Data.enableMockUser(false));
    }

    public async reloadMapgenieScript() {
        const script = await $.waitFor<HTMLScriptElement>("script[src^='https://cdn.mapgenie.io/js/map.js?id=']");

        script.remove();

        const src = script.attr("src");
        if (!src) throw "map.js script has no src.";

        $("<script/>").attr("src", src.replace("id=", "ready&id=")).appendTo(document.body);
    }
}

export default new Page();
