import { $waitFor, type JQueryAsync } from "@utils/jquery";

import data from "./data";
import channel from "./channel";

class Page {
    public get userPanel(): JQueryAsync<HTMLDivElement> {
        return $waitFor("#user-panel");
    }

    public get userPanelFeatures(): JQueryAsync<HTMLDivElement> {
        return $waitFor("#user-panel .features");
    }

    public get mapgenieScript(): JQueryAsync<HTMLScriptElement> {
        return $waitFor<HTMLScriptElement>("script[src^='https://cdn.mapgenie.io/js/map.js?id=']");
    }

    public async addMapgenieScript() {
        const script = await this.mapgenieScript;

        const src = script.remove().attr("src")!;
        const readySrc = src.replace("id=", "ready&id=");

        $("<script/>").attr("src", readySrc).appendTo(document.body);
    }

    public async initLoginButton() {
        const btn = await $waitFor<HTMLAnchorElement>(`#user-panel a[href$="/login"]`, { message: "No login button" });
        btn.on("click", () => channel.sendStartLogin());
    }

    public async initLogoutButton() {
        const btn = await $waitFor<HTMLAnchorElement>(`.logout a[href$="/logout"]`, { message: "No logout button" });
        btn.on("click", () => data.enableMockUser(false));
    }
}

export default new Page();
