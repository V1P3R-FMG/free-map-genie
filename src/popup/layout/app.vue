<script setup lang="ts">
import Theme from "../components/theme.vue";
import IconButton from "@components/icon-button.vue";

import Frame from "../components/frame/frame.vue";
import Page from "../components/frame/page.vue";

import Bookmarks from "./bookmarks/bookmarks.vue";
import Settings from "./settings/settings.vue";
import Info from "./info/info.vue";
import Data from "./data/data.vue";

import Version from "./version.vue";

import { ref } from "vue";
import { send } from "@shared/send";
import {
    getDefaultData,
    getOptions,
    setData,
    getData
} from "@shared/extension";

var dataLoaded = false;

const author = __AUTHOR__;
const version = __VERSION__ + (__DEBUG__ ? "-dev" : "");

var bookmarksRaw: FMG.Extension.Bookmarks = [];
const bookmarks = ref<FMG.Extension.Bookmarks>(bookmarksRaw);

const options = getOptions();
var settingsRaw = getDefaultData();
const settings = ref<FMG.Extension.Settings>(settingsRaw);

const info = ref({});

async function save() {
    if (!dataLoaded) return;
    // #if DEBUG
    logger.log("Saving data", {
        bookmarks: bookmarksRaw,
        settings: settingsRaw
    });
    // #endif
    setData({
        bookmarks: bookmarksRaw,
        settings: settingsRaw
    });
}

async function load() {
    if (dataLoaded) return;
    const data = await getData();
    bookmarksRaw = data.bookmarks;
    settingsRaw = data.settings;
    bookmarks.value = bookmarksRaw;
    settings.value = settingsRaw;
    // #if DEBUG
    logger.log("Loaded data", {
        bookmarks: bookmarksRaw,
        settings: settingsRaw
    });
    // #endif
    dataLoaded = true;
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

function importData() {
    send("import-data");
}

function exportData() {
    send("export-data");
}

function clearData() {
    send("clear-data");
}

async function addBookmark() {
    try {
        const bookmark = await send("add-bookmark");
        if (!bookmark.url || !bookmark.favicon || !bookmark.title) {
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

async function getInfo() {
    try {
        info.value = await send("get-info", null, {
            timeout: 5000,
            retry: true
        });
    } catch (err) {
        logger.error("getInfo failed,", err as any);
    }
}

async function settingsChanged(name: string, value: any) {
    settings.value[name as keyof FMG.Extension.Settings] = value;
    await save();
}

load();
getInfo();
</script>

<template>
    <Theme theme="auto">
        <div class="container">
            <div class="titlebar">
                <IconButton
                    icon="g"
                    title="mapgenie"
                    size="20px"
                    @click="openMapGenie"
                />
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
                        :options="options"
                        :settings="settings"
                        @change="settingsChanged"
                    />
                </Page>
                <Page name="info" icon="doc">
                    <Info :info="<any>info" />
                </Page>
                <Page name="data" icon="database">
                    <Data
                        @import="importData"
                        @export="exportData"
                        @clear="clearData"
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
