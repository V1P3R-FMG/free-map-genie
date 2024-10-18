import bus from "@popup/bus";

import { sendMessage } from "@shared/channel/popup";
import { waitFor } from "@utils/async";
import { ThemeName } from "@ui/components/theme-provider.vue";
import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

class PopupChannel {
    public async waitForConnected(timeout: number = 10000) {
        return waitFor(
            async (resolve) => {
                try {
                    await sendMessage("extension", "ping", {}, 500);
                    resolve();
                } catch {}
            },
            {
                timeout,
                message: "Waiting for extension took to long.",
            }
        );
    }

    public async waitForOffscreenConnected(timeout: number = 10000) {
        return waitFor(
            async (resolve) => {
                try {
                    await sendMessage("offscreen", "ping", {}, 500);
                    resolve();
                } catch {}
            },
            {
                timeout,
                message: "Waiting for offscreen took to long.",
            }
        );
    }

    async getLatestVersion(timeout?: number) {
        return sendMessage("background", "latest:version", {}, timeout);
    }

    async reloadActiveTab(timeout?: number) {
        return sendMessage("background", "reload:active:tab", {}, timeout);
    }

    async getThemePreference(timeout?: number) {
        const theme = await sendMessage("offscreen", "get", { key: "fmg:theme:v3" }, timeout);
        return (theme as ThemeName | null) ?? "auto";
    }

    async setThemePreference(theme: ThemeName, timeout?: number) {
        await sendMessage("offscreen", "set", { key: "fmg:theme:v3", value: theme }, timeout);
    }

    async reloadExtension(timeout?: number) {
        return sendMessage("background", "reload:extension", {}, timeout);
    }

    async getMapSettings(timeout?: number) {
        return sendMessage("content-script", "settings", {}, timeout);
    }

    async getBookmarks(timeout?: number): Promise<BookmarkData[]> {
        await this.waitForOffscreenConnected(timeout);
        return JSON.parse((await sendMessage("offscreen", "get", { key: "fmg:bookmarks:v3" }, timeout)) ?? "[]");
    }

    async setBookmarks(bookmarks: BookmarkData[], timeout?: number) {
        return sendMessage("offscreen", "set", { key: "fmg:bookmarks:v3", value: JSON.stringify(bookmarks) }, timeout);
    }

    async clearBookmarks(timeout?: number) {
        return sendMessage("offscreen", "remove", { key: "fmg:bookmarks:v3" }, timeout);
    }

    async createBookmark(timeout?: number): Promise<BookmarkData | undefined> {
        try {
            return sendMessage("background", "create:bookmark", {}, timeout);
        } catch (error) {
            bus.$emit("alert-error", `${error}`);
        }
    }

    async addBookmark(timeout?: number): Promise<BookmarkData[]> {
        const bookmarks = await this.getBookmarks(timeout);

        const bookmark = await this.createBookmark(timeout);

        if (!bookmark) return bookmarks;

        const bookmarkDoesNotExists = !!bookmarks.find((b) => b.url === bookmark.url);
        if (bookmarkDoesNotExists) {
            bus.$emit("alert-warn", `Skipping bookmark for ${bookmark.title}, Because it already exists`);
            return bookmarks;
        }

        const newBookmarks = [...bookmarks, bookmark];

        await this.setBookmarks(newBookmarks, timeout);

        return newBookmarks;
    }

    async removeBookmark(bookmark: BookmarkData, timeout?: number): Promise<BookmarkData[]> {
        const bookmarks = await this.getBookmarks(timeout);

        const newBookmarks = bookmarks.filter((b) => b.url != bookmark.url);

        if (newBookmarks.length) {
            await this.setBookmarks(newBookmarks, timeout);
        } else {
            await this.clearBookmarks(timeout);
        }

        return newBookmarks;
    }
}

export default new PopupChannel();
