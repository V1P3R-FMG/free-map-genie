<script lang="ts" setup>
import { ref } from "vue";

import AlertContainer from "@ui/components/alerts/alert-container.vue";
import ThemeProvider from "@ui/components/theme-provider.vue";
import PageContainer from "@ui/components/page-container.vue";
import FontIcon from "@ui/components/font-icon.vue";

import BookmarksPage from "./pages/bookmarks-page.vue";
import SettingsPage from "./pages/settings-page.vue";

import AppVersion from "./app-version.vue";

import channel from "./channel";
import bus from "./bus";

type State = "connected" | "disconnected";

const author = __AUTHOR__;
const state = ref<State>("disconnected");

function openHomepage() {
    chrome.tabs.create({ url: __HOMEPAGE__ });
}

function openMapgenie() {
    chrome.tabs.create({ url: "https://mapgenie.io" });
}

function close() {
    window.close();
}

async function reloadActiveTab() {
    if (!(await channel.reloadActiveTab())) {
        bus.$emit("alert-error", "Failed to reload active tab.");
        return;
    }

    const clean = () => {
        clearInterval(iHandle);
        clearTimeout(tHandle);
    }; //

    const iHandle = setInterval(async () => {
        try {
            await channel.waitForConnected(250);
            window.location.reload();
            clean();
        } catch {}
    }, 250);

    const tHandle = setTimeout(() => {
        bus.$emit("alert-error", "Failed to reload active tab.");
        clean();
    }, 10000);
}

async function reloadExtension() {
    await channel.reloadExtension();
}

channel.getMapSettings().then(logging.debug);

async function main() {
    await channel.waitForConnected();
    state.value = "connected";
}

main();
</script>

<template>
    <ThemeProvider theme="dark" :modify="{ active: '#ED6363' }">
        <AlertContainer />
        <div class="app-container">
            <div class="titlebar">
                <div class="buttons buttons-left">
                    <button class="btn" @click="openMapgenie">
                        <img id="mapgenie-logo" src="/assets/icons/mapgenie-icon.png" />
                    </button>
                </div>
                <h3 class="title">
                    <span class="bold">map</span> <span class="light">genie</span><sup class="pro">PRO</sup>
                </h3>
                <div class="buttons buttons-right">
                    <button class="btn" @click="reloadExtension">
                        <FontIcon icon="reload" />
                    </button>
                    <button class="btn" @click="close">
                        <FontIcon icon="cross" />
                    </button>
                </div>
            </div>

            <PageContainer page="bookmarks">
                <BookmarksPage />
                <SettingsPage />
            </PageContainer>

            <div class="footer">
                <span class="author" @click="openHomepage">by {{ author }}</span>
                <span class="state" :class="{ connected: state === 'connected' }">
                    <button class="btn" @click="reloadActiveTab">
                        <FontIcon v-if="state === 'disconnected'" icon="reload" size="0.8rem" />
                    </button>
                    {{ state }}
                </span>
                <AppVersion />
            </div>
        </div>
    </ThemeProvider>
</template>

<style lang="css">
.app-container {
    background-color: var(--background);
    color: var(--color);
    width: 405px;
    padding: 8px 5px 5px 5px;
    font-family: Arial, Helvetica, sans-serif;
}

.bold {
    font-weight: bold;
}

.light {
    font-weight: 100;
}

.titlebar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 5px;
    padding-bottom: 5px;
    border-bottom: solid 1px var(--border);
}

.title {
    font-size: 1.2rem;
    text-transform: uppercase;
    grid-column: 2;
    margin: 0;
}

.pro {
    font-weight: 200;
    color: var(--active);
    font-size: 0.6em;
    padding-left: 3px;
}

.footer {
    user-select: none;
    display: flex;
    justify-content: space-between;
    margin: 0 5px;
    padding: 6px 5px 0 5px;
    color: var(--color-light);
    border-top: solid 1px var(--border);
}

@-moz-document url-prefix() {
    .footer {
        font-size: 0.8em;
    }
}

.author {
    cursor: pointer;
}

.state {
    color: red;
}

.state.connected {
    color: green;
}

.btn {
    background: none;
    color: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transform: translateY(2px);
    color: inherit;
}

.btn:hover {
    color: var(--active);
}

.buttons {
    display: flex;
    gap: 10px;
}

#mapgenie-logo {
    position: relative;
    width: 26px;
    height: 26px;
    border-radius: 50%;
}
</style>
