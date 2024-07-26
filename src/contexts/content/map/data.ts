import { FmgMockedUserKey } from "@constants";
import { waitForCondition, waitFor } from "@utils/async";

class Data {
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

    public isMockUserActive(): boolean {
        return window.localStorage.getItem(FmgMockedUserKey) != null;
    }

    public isLoggedIn(): boolean {
        return !!window.user;
    }

    public enableMockUser(enabled: boolean = true) {
        if (enabled) {
            window.localStorage.setItem(FmgMockedUserKey, "1");
        } else {
            window.localStorage.removeItem(FmgMockedUserKey);
        }
    }

    public async login(): Promise<boolean> {
        if (window.user) {
            return true;
        }

        if (this.isMockUserActive()) {
            await waitForCondition(() => window.user !== undefined);
            window.user = this.createMockUser();
            logger.debug("Loaded mocked user");
            return true;
        }

        return false;
    }

    public async fixGoogleMaps() {
        await waitForCondition(() => window.google !== undefined);
        if (window.config?.altMapSdk) {
            window.google!.maps = {
                Size: function () {},
            };
        }
    }

    public async getStore() {
        return waitFor<MG.Store>(
            (resolve) => {
                if (window.store) {
                    resolve(window.store);
                }
            },
            { message: "Wait for window.store took to long." }
        );
    }
}

export default new Data();
