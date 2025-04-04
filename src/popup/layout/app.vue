<script setup lang="ts">
import { ref } from "vue";

import Theme from "../components/theme.vue";
import IconButton from "@components/icon-button.vue";

import Frame from "../components/frame/frame.vue";
import Page from "../components/frame/page.vue";

import Bookmarks from "./bookmarks/bookmarks.vue";
import Settings from "./settings/settings.vue";
import Info from "./info/info.vue";
import Data from "./data/data.vue";

import Version from "./version.vue";

import { FMG_ExportHelper, type ExportedData } from  "@fmg/storage/data/export";

import { sleep } from "@shared/async";
import channel from "@shared/channel/popup";
import Options from "options.json";
import { FMG_ImportHelper } from "@fmg/storage/data/import";
import { State } from "@content/index";

const author = __AUTHOR__;
const version = __VERSION__ + (__DEBUG__ ? "-dev" : "");

var bookmarksRaw: FMG.Extension.Bookmarks = [];
const bookmarks = ref(bookmarksRaw);

var settingsRaw:FMG.Extension.Settings = {} as any;
const settings = ref(settingsRaw);

const state = ref<State>({
    attached: false,
    user: "n/a",
    type: "unknown"
});

async function save() {
    logger.debug("Saving data", {
        bookmarks: bookmarksRaw,
        settings: settingsRaw
    });

    await Promise.all([
        channel.offscreen.setBookmarks({ bookmarks: bookmarksRaw }),
        channel.offscreen.setSettings({ settings: settingsRaw })
    ]);
}

async function loadBookmarks() {
    bookmarksRaw = await channel.offscreen.getBookmarks();
    bookmarks.value = bookmarksRaw;
}

async function loadSettings() {
    settingsRaw = await channel.offscreen.getSettings();
    settings.value = settingsRaw;
}

async function load() {
    await Promise.all([
        loadBookmarks(),
        loadSettings()
    ]);
    
    logger.debug("Loaded data", {
        bookmarks: bookmarksRaw,
        settings: settingsRaw
    });
}

function reload() {
    chrome.runtime.reload();
}

function openMapGenie() {
    chrome.tabs.create({ url: "https://mapgenie.io/" });
}

function closePopup() {
    window.close();
}

function openHomepage() {
    chrome.tabs.create({ url: __HOMEPAGE__ });
}

async function importData() {
    try {
        const importData = await FMG_ImportHelper.showFilePicker();
        if (importData) {
            await channel.content.importData({ json: importData });
        }
    } catch (err) {
        channel.content.toastrError({ message: String(err) });
        closePopup()
    }
}

async function exportData() {
    try {
        const exportData = await channel.content.exportData();
        if (exportData) {
            await FMG_ExportHelper.saveFile(exportData);
        }
    } catch (err) {
        channel.content.toastrError({ message: String(err) });
        closePopup()
    }
}

async function clearData() {
    try {
        await channel.content.clearData();
    } catch (err) {
        channel.content.toastrError({ message: String(err) });
        closePopup()
    }
}

async function importMapgenieAccount() {
    try {
        await channel.content.importMapgenieAccount();
    } catch (err) {
        channel.content.toastrError({ message: String(err) });
        closePopup()
    }
}

async function addBookmark() {
    try {
        const bookmark = await channel.extension.addBookmark();

        if (!bookmark || !bookmark.url || !bookmark.favicon || !bookmark.title) {
            logger.warn("Invalid bookmark", bookmark);
            return;
        }

        const sameBookmark = bookmarks.value.find(
            (bm) => bm.url === bookmark.url
        );
        if (sameBookmark !== undefined) {
            logger.warn("Bookmark already exists", {
                bookmark,
                sameBookmark
            });
            return;
        }
        bookmarks.value.push(bookmark);
        await save();
    } catch (err) {
        logger.error("addBookmark faild", err as any);
    }
}

async function removeBookmark(url: string) {
    const index = bookmarks.value.findIndex((bookmark) => bookmark.url === url);
    if (index === -1) return;
    bookmarks.value.splice(index, 1);
    await save();
}

async function setState() {
    state.value = await channel.content.getState(void 0, 60000);

    let busy = false;
    setInterval(async () => {
        if (busy) return;
        try {
            busy = true;
            state.value = await channel.content.getState(void 0, 60000);
        } catch (err) {
            logger.error("getInfo failed,", err as any);
        }
        busy = false;
    }, 1000);
}

async function settingsChanged(name: string, value: any) {
    settings.value[name as keyof FMG.Extension.Settings] = value;
    await save();
}

load();
setState();
</script>

<template>
    <Theme theme="auto">
        <div class="container">
            <div class="titlebar">
                <div class="titlebar-button-group">
                    <IconButton
                        icon="reload"
                        title="reload"
                        size="20px"
                        @click="reload"
                    />
                    <IconButton
                        icon="g"
                        title="mapgenie"
                        size="20px"
                        @click="openMapGenie"
                    />
                </div>
                <h3 class="title">MapGenie<sup class="pro">PRO</sup></h3>
                <IconButton
                    icon="cancel"
                    title="close"
                    size="30px"
                    @click="closePopup"
                />
            </div>
            <Frame page="bookmarks">
                <Page name="bookmarks" icon="bookmark">
                    <Bookmarks
                        :bookmarks="bookmarks"
                        @add-bookmark="addBookmark"
                        @remove-bookmark="removeBookmark"
                    />
                </Page>
                <Page name="settings" icon="cog">
                    <Settings
                        :options="Options"
                        :settings="settings"
                        @change="settingsChanged"
                    />
                </Page>
                <Page name="info" icon="doc">
                    <Info :state="state" />
                </Page>
                <Page name="data" icon="database">
                    <Data
                        :state="state"
                        @import="importData"
                        @export="exportData"
                        @clear="clearData"
                        @import-mg-account="importMapgenieAccount"
                    />
                </Page>
            </Frame>
            <div class="footer">
                <span class="author" @click="openHomepage"
                    >by {{ author }}</span
                >
                <!-- <span class="version">v{{ version }}</span> -->
                <Version :version="version" />
            </div>
        </div>
    </Theme>
</template>

<style lang="scss">
#app {
    width: 400px;
    transition: height 0.2s ease-in-out;
}

.container {
    background-color: var(--background);
    border: 1px solid var(--background);
    color: var(--color);
}

.pro {
    font-weight: 200;
    color: var(--active);
    font-size: 0.6em;
    padding-left: 3px;
}

body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    font-size: 14px;
    border-radius: 5px;
}

.titlebar h3 {
    margin: 0;
}

.titlebar,
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 5px;
    -webkit-user-select: none;
    user-select: none;
    padding: 5px;
}

.titlebar {
    border-bottom: solid 1px var(--border);
}

.footer {
    color: var(--color-light);
    border-top: solid 1px var(--border);
    font-size: 0.9em;
}
</style>
