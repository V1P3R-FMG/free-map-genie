import { PageScript } from "../index";

import page from "./page";
import data from "./data";
import elements from "./elements";

class MapScript implements PageScript {
    public async initScript() {
        await data.login();

        data.fixGoogleMaps();
        await page.addMapgenieScript();

        this.initButtons();
    }

    public async initButtons() {
        if (await data.isLoggedIn()) {
            await page.initLogoutButton();
        } else {
            await page.initLoginButton();
            elements.addMockUserButton();
        }
    }
}

export default new MapScript();
