import bus from "@popup/bus";

import channel from "@shared/channel/popup";
import { waitFor } from "@utils/async";
import { ThemeName } from "@ui/components/theme-provider.vue";
import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

channel.connect();

class PopupChannel {
    public async waitForConnected(timeout: number = 10000) {
        return waitFor(
            async (resolve) => {
                try {
                    await channel.extension.ping(null, 500);
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
                    await channel.offscreen.ping(null, 500);
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
        return channel.background.latestVersion(null, timeout);
    }

    async reloadActiveTab(timeout?: number) {
        return channel.background.reloadActiveTab(null, timeout);
    }

    async getThemePreference(timeout?: number) {
        return channel.offscreen.get({ key: "fmg:theme:v3", dflt: "auto" }, timeout) as Promise<ThemeName>;
    }

    async setThemePreference(theme: ThemeName, timeout?: number) {
        await channel.offscreen.set({ key: "fmg:theme:v3", value: theme }, timeout);
    }

    async reloadExtension(timeout?: number) {
        return channel.background.reloadExtension(null, timeout);
    }

    async getMapSettings(timeout?: number) {
        return channel.content.settings(null, timeout);
    }

    async getBookmarks(timeout?: number): Promise<BookmarkData[]> {
        await this.waitForOffscreenConnected(timeout);
        const bookmarks = await channel.offscreen.get({ key: "fmg:bookmarks:v3" }, timeout);
        return JSON.parse(bookmarks ?? "[]");
    }

    async setBookmarks(bookmarks: BookmarkData[], timeout?: number) {
        return channel.offscreen.set({ key: "fmg:bookmarks:v3", value: JSON.stringify(bookmarks) }, timeout);
    }

    async clearBookmarks(timeout?: number) {
        return channel.offscreen.remove({ key: "fmg:bookmarks:v3" }, timeout);
    }

    async createBookmark(timeout?: number): Promise<BookmarkData | undefined> {
        try {
            return channel.background.createBookmark(null, timeout);
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
