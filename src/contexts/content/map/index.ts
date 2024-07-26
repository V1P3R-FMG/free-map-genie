import { PageScript } from "../index";

import Page from "./page";
import Data from "./data";

class MapScript implements PageScript {
    public async initScript() {
        this.doLogin();
        await this.reloadMapgenieScript();
        this.initButtons();
    }

    public doLogin() {
        Data.login();
    }

    public async reloadMapgenieScript() {
        await Promise.sleep(250);
        Data.fixGoogleMaps();
        Page.reloadMapgenieScript();
    }

    public async initButtons() {
        if (Data.isLoggedIn()) {
            await Page.initLogoutButton();
        } else {
            await Page.initLoginButton();
            Page.addMockUserButton();
        }
    }
}

export default new MapScript();
