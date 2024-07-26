import Data from "./data";
import Channel from "./channel";
import { $waitFor, type JQueryAsync } from "@utils/jquery";

class Page {
    /** Creates and appends a user mock button to the '#user-panel' */
    public async addMockUserButton(): JQueryAsync<HTMLAnchorElement> {
        const features = await $waitFor("#user-panel .features");
        return $<HTMLAnchorElement>("<a/>")
            .text("Mock User")
            .addClass("btn btn-outline-secondary")
            .attr({
                id: "fmg-mock-user-btn",
                href: window.location.href,
            })
            .on("click", () => {
                Data.enableMockUser(true);
                window.location.reload();
            })
            .insertBefore(features);
    }

    /** Creates and appends the mapgenie script */
    public async addMapgenieScript() {
        const script = await $waitFor<HTMLScriptElement>("script[src^='https://cdn.mapgenie.io/js/map.js?id=']");

        const src = script.remove().attr("src")!;
        const readySrc = src.replace("id=", "ready&id=");

        $("<script/>").attr("src", readySrc).appendTo(document.body);
    }

    /**  Listen for Login button click to send a start:login request to the background  */
    public async initLoginButton() {
        const btn = await $waitFor<HTMLAnchorElement>(`#user-panel a[href$="/login"]`, { message: "No login button" });
        btn.on("click", () => Channel.sendStartLogin());
    }

    /**  Listen for logout button click to remove mock user object  */
    public async initLogoutButton() {
        const btn = await $waitFor<HTMLAnchorElement>(`.logout a[href$="/logout"]`, { message: "No logout button" });
        btn.on("click", () => Data.enableMockUser(false));
    }
}

export default new Page();
