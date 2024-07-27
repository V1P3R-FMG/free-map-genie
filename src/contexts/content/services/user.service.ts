import { waitForCondition } from "@utils/async";
import { FmgMockedUserKey } from "@constants";
import { getPageType } from "@fmg/page";

class UserService {
    public createMockUser(): MG.User {
        return {
            id: -1,
            role: "user",
            hasPro: true,
            locations: [],
            trackedCategoryIds: [],
            presets: [],
            suggestions: [],
        };
    }

    public async getUser() {
        switch (getPageType()) {
            case "map":
                await waitForCondition(() => window.user !== undefined);
                return window.user;
            default:
                return null;
        }
    }

    public enableMockUser(enabled: boolean) {
        if (enabled) {
            window.localStorage.setItem(FmgMockedUserKey, "1");
        } else {
            window.localStorage.removeItem(FmgMockedUserKey);
        }
    }

    public isMockUserActive() {
        return window.localStorage.getItem(FmgMockedUserKey) != null;
    }

    public async isLoggedIn() {
        return Boolean(await this.getUser());
    }

    public async login() {
        if (window.user) return true;

        if (this.isMockUserActive()) {
            await waitForCondition(() => window.user !== undefined);
            window.user = this.createMockUser();
            logger.debug("Loaded mocked user");
            return true;
        }

        return false;
    }
}

export default new UserService();
