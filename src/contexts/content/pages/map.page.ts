import { $waitFor } from "@utils/jquery";

import userChannel from "@content/channels/user.channel";

import userService from "@content/services/user.service";
import mapService from "@content/services/map.service";

class MapPage {
    public get userPanel() {
        return $waitFor<HTMLDivElement>("#user-panel");
    }

    public get userPanelFeatures() {
        return $waitFor<HTMLDivElement>("#user-panel .features");
    }

    public get mapgenieScript() {
        return $waitFor<HTMLScriptElement>("script[src^='https://cdn.mapgenie.io/js/map.js?id=']");
    }

    public get loginButton() {
        return $waitFor<HTMLAnchorElement>(`#user-panel a[href$="/login"]`, { message: "No login button" });
    }

    public get logoutButton() {
        return $waitFor<HTMLAnchorElement>(`.logout a[href$="/logout"]`, { message: "No logout button" });
    }

    public async addMapgenieScript() {
        const src = await mapService.getMapSrc();
        $("<script/>").attr("src", src.replace("id=", "ready&id=")).appendTo(document.body);
    }

    public async addMockUserButton() {
        return $<HTMLAnchorElement>("<a/>")
            .text("Mock User")
            .addClass("btn btn-outline-secondary")
            .attr({
                id: "fmg-mock-user-btn",
            })
            .on("click", () => {
                userService.enableMockUser(true);
                window.location.reload();
            })
            .insertBefore(await this.userPanelFeatures);
    }

    public async initLoginButton() {
        const btn = await this.loginButton;
        btn.on("click", () => userChannel.sendStartLogin());
    }

    public async initLogoutButton() {
        const btn = await this.logoutButton;
        btn.on("click", () => userService.enableMockUser(false));
    }

    public async initButtons() {
        if (await userService.isLoggedIn()) {
            await this.initLogoutButton();
        } else {
            await this.initLoginButton();
            this.addMockUserButton();
        }
    }
}

export default new MapPage();
