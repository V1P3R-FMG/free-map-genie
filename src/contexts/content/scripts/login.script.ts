import userService from "@content/services/user.service";

import loginPage from "@content/pages/login.page";

class LoginScript implements PageScript {
    public async initScript() {
        userService.enableMockUser(false);

        await loginPage.addSpace();
        await loginPage.addMockUserButton();
    }
}

export default new LoginScript();
