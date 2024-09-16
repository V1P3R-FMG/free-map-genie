import bus from "@popup/bus";

import Channel from "@shared/channel";
import { Channels } from "@constants";

import type { MessageScheme as ContentMessageScheme } from "@content/index";
import type { ExtensionMessageScheme, CreateBookmarkResult } from "@extension/index";
import type { MessageScheme as StorageMessageScheme } from "contexts/storage/main";
import type { V3SettingsData } from "@content/storage/data/v3";

import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

class PopupChannel {
    private readonly channel = Channel.extension(Channels.Popup);

    private async sendContent(data: ContentMessageScheme, timeout?: number) {
        return this.channel.send(Channels.Extension, data, timeout);
    }

    private async sendExtension(data: ExtensionMessageScheme, timeout?: number) {
        return this.channel.send(Channels.Extension, data, timeout);
    }

    private async sendStorage(data: StorageMessageScheme, timeout?: number) {
        return this.channel.send(Channels.Mapgenie, data, timeout);
    }

    public async waitForConnected() {
        await this.channel.waitForChannel(Channels.Extension, 10000);
    }

    async getMapSettings(timeout?: number): Promise<V3SettingsData> {
        return this.sendContent({ type: "settings", data: undefined }, timeout);
    }

    async getBookmarks(timeout?: number): Promise<BookmarkData[]> {
        return JSON.parse(
            (await this.sendStorage({ type: "get", data: { key: "fmg:bookmarks:v3" } }, timeout)) ?? "[]"
        );
    }

    async setBookmarks(bookmarks: BookmarkData[], timeout?: number) {
        return this.sendStorage(
            { type: "set", data: { key: "fmg:bookmarks:v3", value: JSON.stringify(bookmarks) } },
            timeout
        );
    }

    async clearBookmarks(timeout?: number) {
        return this.sendStorage({ type: "remove", data: { key: "fmg:bookmarks:v3" } }, timeout);
    }

    async createBookmark(timeout?: number): Promise<CreateBookmarkResult> {
        return this.sendExtension({ type: "create-bookmark", data: undefined }, timeout);
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
