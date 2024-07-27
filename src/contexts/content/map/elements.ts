import type { JQueryAsync } from "@utils/jquery";

import data from "./data";
import page from "./page";

class Elements {
    public async addMockUserButton(): JQueryAsync<HTMLAnchorElement> {
        return $<HTMLAnchorElement>("<a/>")
            .text("Mock User")
            .addClass("btn btn-outline-secondary")
            .attr({
                id: "fmg-mock-user-btn",
                href: window.location.href,
            })
            .on("click", () => data.enableMockUser(true))
            .insertBefore(await page.userPanelFeatures);
    }
}

export default new Elements();
