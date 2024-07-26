import { PageScript } from "../index";

import Data from "./data";
import Page from "./page";
class LoginScript implements PageScript {
    public async initScript() {
        Data.enableMockUser(false);
        await Page.addSpace();
        await Page.addMockUserButton();
    }
}

export default new LoginScript();
