import { FmgMockedUserKey } from "@constants";

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
            await Promise.waitForCondition(() => window.user !== undefined);
            window.user = this.createMockUser();
            logger.debug("Loaded mocked user");
            return true;
        }

        return false;
    }

    public async fixGoogleMaps() {
        await Promise.waitForCondition(() => window.google !== undefined);
        if (window.config?.altMapSdk) {
            window.google!.maps = {
                Size: function () {},
            };
        }
    }

    public async getStore() {
        return Promise.waitFor<MG.Store>(
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
