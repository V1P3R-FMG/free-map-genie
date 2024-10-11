<script lang="ts" setup>
import { ComponentInstance, onMounted, ref } from "vue";

import AlertContainer from "@ui/components/alerts/alert-container.vue";
import ThemeProvider, { type ThemeName } from "@ui/components/theme-provider.vue";
import PageContainer from "@ui/components/page-container.vue";
import FontIcon from "@ui/components/font-icon.vue";

import BookmarksPage from "./pages/bookmarks-page.vue";
import SettingsPage from "./pages/settings-page.vue";

import AppVersion from "./app-version.vue";

import channel from "./channel";
import bus from "./bus";

const themeProvider = ref<ComponentInstance<typeof ThemeProvider>>();

type State = "connected" | "disconnected";

const author = __AUTHOR__;
const state = ref<State>("disconnected");

const themePreference = ref<ThemeName | "auto">("auto");
const theme = ref<ThemeName | undefined>();

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

async function setTheme(name: ThemeName) {
    themeProvider.value?.setTheme(name);
    await channel.setThemePreference(name);
}

async function setThemePreference() {
    logging.debug(await channel.getThemePreference());
    themePreference.value = await channel.getThemePreference();
}

async function setConnectionState() {
    await channel.waitForConnected();
    state.value = "connected";
}

onMounted(async () => {
    theme.value = themeProvider.value?.getTheme();

    await Promise.all([setThemePreference(), setConnectionState()]);
});

channel.getMapSettings().then(logging.debug);
</script>

<template>
    <ThemeProvider
        :theme="themePreference"
        :modify="{ active: '#ED6363' }"
        ref="themeProvider"
        @changed="(name) => (theme = name)"
    >
        <AlertContainer />
        <div class="app-container">
            <div class="titlebar">
                <div class="buttons buttons-left">
                    <button class="btn" id="mapgenie-btn" @click="openMapgenie">
                        <img id="mapgenie-logo" src="/assets/icons/mapgenie-icon.png" />
                    </button>
                </div>
                <h3 class="title">
                    <span class="bold">map</span> <span class="light">genie</span><sup class="pro">PRO</sup>
                </h3>
                <div class="buttons buttons-right">
                    <button v-if="theme === 'dark'" class="btn" @click="setTheme('light')">
                        <FontIcon icon="light" />
                    </button>
                    <button v-if="theme === 'light'" class="btn" @click="setTheme('dark')">
                        <FontIcon icon="dark" />
                    </button>
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
    display: grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: 1fr 3fr 1fr;
    margin: 0 5px;
    padding-bottom: 5px;
    border-bottom: solid 1px var(--border);
}

.title {
    font-size: 1.2rem;
    text-transform: uppercase;
    grid-column: 2;
    margin: 0;
    text-align: center;
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

#mapgenie-btn {
    --drop-shadow-color: color-mix(in srgb, var(--color) 50%, transparent);
    filter: drop-shadow(0 0 1px var(--drop-shadow-color));
}
</style>
