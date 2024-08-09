import * as async from "@utils/async";

import { FmgMockedUserKey } from "@constants";
import { getPageType } from "@fmg/page";

import Key from "@content/storage/key";

import storageService from "@content/services/storage.service";

class UserService {
    public createMockUser(): MG.User {
        return {
            id: -1,
            role: "user",
            hasPro: true,
            locations: {},
            trackedCategoryIds: [],
            presets: [],
            suggestions: [],
        };
    }

    public async getUser() {
        switch (getPageType()) {
            case "map":
                await async.waitForCondition(() => window.user !== undefined);
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
            await async.waitForCondition(() => window.user !== undefined);
            window.user = this.createMockUser();
            logging.debug("Loaded mocked user");
            return true;
        }

        return false;
    }

    public async load() {
        if (!window.user) return;

        const data = await storageService.load(Key.fromWindow(window));

        window.user.hasPro = true;
        window.user.locations = data.locations;
        window.user.trackedCategoryIds = data.categories.values();
    }
}

export default new UserService();
