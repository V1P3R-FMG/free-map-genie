import bus from "@popup/bus";

import type { CreateBookmarkResult } from "@extension/bookmarks";

import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";
import { sendMessage } from "@shared/channel/popup";

class PopupChannel {
    public async waitForConnected(timeout: number = 10000) {
        await sendMessage("extension", "ping", {}, timeout);
    }

    async getLatestVersion(timeout?: number) {
        return sendMessage("background", "latest:version", {}, timeout);
    }

    async reloadActiveTab(timeout?: number) {
        return sendMessage("background", "reload:active:tab", {}, timeout);
    }

    async getMapSettings(timeout?: number) {
        return sendMessage("content-script", "settings", {}, timeout);
    }

    async getBookmarks(timeout?: number): Promise<BookmarkData[]> {
        return JSON.parse((await sendMessage("offscreen", "get", { key: "fmg:bookmarks:v3" }, timeout)) ?? "[]");
    }

    async setBookmarks(bookmarks: BookmarkData[], timeout?: number) {
        return sendMessage("offscreen", "set", { key: "fmg:bookmarks:v3", value: JSON.stringify(bookmarks) }, timeout);
    }

    async clearBookmarks(timeout?: number) {
        return sendMessage("offscreen", "remove", { key: "fmg:bookmarks:v3" }, timeout);
    }

    async createBookmark(timeout?: number): Promise<CreateBookmarkResult> {
        return sendMessage("extension", "bookmark:create", {}, timeout);
    }

    async addBookmark(timeout?: number): Promise<BookmarkData[]> {
        const bookmarks = await this.getBookmarks(timeout);
        const result = await this.createBookmark(timeout);

        if (!result.success) {
            bus.$emit("alert-error", result.data);
            return bookmarks;
        }

        const bookmark = result.data;

        const bookmarkDoesNotExists = !!bookmarks.find((b) => b.url === bookmark.url);
        if (bookmarkDoesNotExists) {
            bus.$emit("alert-warn", "Skipping bookmark because it already exists");
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
