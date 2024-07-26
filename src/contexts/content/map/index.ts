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
        await Data.fixGoogleMaps();
        Page.addMapgenieScript();

        const store = await Data.getStore();
        store.dispatch({
            type: "MG:MAP:SHOW_SPECIFIC_LOCATIONS",
            meta: {
                locationIds: [71259],
                categoryIds: [],
            },
        });
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
