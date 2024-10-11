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

channel.getMapSettings().then(logging.debug);

async function main() {
    await channel.waitForConnected();
    state.value = "connected";
}

main();
</script>

<template>
    <ThemeProvider theme="dark">
        <AlertContainer />
        <div class="app-container">
            <div class="titlebar">
                <h3 class="title">
                    <span class="bold">map</span> <span class="light">genie</span><sup class="pro">PRO</sup>
                </h3>
            </div>

            <PageContainer page="bookmarks">
                <BookmarksPage />
                <SettingsPage />
            </PageContainer>

            <div class="footer">
                <span class="author" @click="openHomepage">by {{ author }}</span>
                <span class="state" :class="{ connected: state === 'connected' }">
                    <button id="footer-reload-button" @click="reloadActiveTab">
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
    display: grid;
    justify-content: center;
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

#footer-reload-button {
    background: none;
    color: none;
    border: none;
    padding: 0;
    transform: translateY(2px);
    color: inherit;
    cursor: pointer;
}

.state {
    color: red;

    gap: 5px;
}

.state.connected {
    color: green;
}
</style>
