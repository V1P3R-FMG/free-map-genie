import { FmgMockedUserKey } from "@constants";

class Data {
    public enableMockUser(enabled: boolean = true) {
        if (enabled) {
            window.localStorage.setItem(FmgMockedUserKey, "1");
        } else {
            window.localStorage.removeItem(FmgMockedUserKey);
        }
    }
}

export default new Data();
