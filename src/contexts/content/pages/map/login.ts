import { FmgMockedUserKey, Channels } from "@constants";
import Channel from "@shared/channel";

function appendMockUserButton() {
    logger.debug($("#user-panel .features"));
    $<HTMLButtonElement>("<a/>")
        .text("Mock User")
        .addClass("btn btn-outline-secondary")
        .attr("href", window.location.href)
        .on("click", () => {
            window.localStorage.setItem(FmgMockedUserKey, "1");
            window.location.reload();
        })
        .insertBefore($("#user-panel .features"));
}

function createMockedUser(id: number = -1, role: MG.UserRole = "user", hasPro: boolean = true): MG.User {
    const locations: number[] = [];
    const trackedCategoryIds: number[] = [];
    const presets: MG.Preset[] = [];
    const suggestions: unknown[] = [];
    return {
        id,
        role,
        hasPro,
        locations,
        trackedCategoryIds,
        presets,
        suggestions,
    };
}

function loadMockUser(): boolean {
    const user = window.localStorage.getItem(FmgMockedUserKey);

    if (window.user && user) {
        window.localStorage.removeItem(FmgMockedUserKey);
        return true;
    } else if (user) {
        window.user ??= createMockedUser();
        return true;
    }
    return false;
}

async function initLoginButton() {
    try {
        const loginButton = await Promise.waitFor<JQuery<HTMLElement>>((resolve) => {
            const btn = $(`#user-panel a[href$="/login"]`);
            if (btn) resolve(btn);
        });

        loginButton.on("click", () => {
            Channel.window(Channels.Content).send(Channels.Extension, {
                type: "start:login",
                data: window.location.href,
            });
        });
    } catch {
        logger.warn("No login button");
    }
}

async function initLogoutButton() {
    try {
        const logoutButton = await Promise.waitFor<JQuery<HTMLElement>>((resolve) => {
            const btn = $(`.logout a[href$="/logout"]`);
            if (btn) resolve(btn);
        });

        logoutButton.on("click", () => {
            window.localStorage.removeItem(FmgMockedUserKey);
        });
    } catch {
        logger.warn("No logout button");
    }
}

export default async function initLogin() {
    await document.waitForDocumentBody();
    if (loadMockUser()) {
        initLogoutButton();
    } else {
        appendMockUserButton();
        initLoginButton();
    }
}
