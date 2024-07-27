import { FmgMockedUserKey } from "@constants";
import { waitForCondition, waitFor } from "@utils/async";

import page from "./page";

class Data {
    public createMockUser() {
        return <MG.User>{
            id: -1,
            role: "user",
            hasPro: true,
            locations: [],
            trackedCategoryIds: [],
            presets: [],
            suggestions: [],
        };
    }

    public isMockUserActive() {
        return window.localStorage.getItem(FmgMockedUserKey) != null;
    }

    public async isLoggedIn() {
        await page.userPanel;
        return !!window.user;
    }

    public enableMockUser(enabled: boolean = true) {
        if (enabled) {
            window.localStorage.setItem(FmgMockedUserKey, "1");
        } else {
            window.localStorage.removeItem(FmgMockedUserKey);
        }
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

    public fixGoogleMaps() {
        if (window.config?.altMapSdk) {
            window.google ??= {};
            window.google.maps ??= { Size: function () {} };
        }
    }

    public async getStore() {
        return waitFor<MG.Store>((resolve) => window.store && resolve(window.store), {
            message: "Wait for window.store took to long.",
        });
    }
}

export default new Data();
