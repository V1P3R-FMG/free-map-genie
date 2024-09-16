<script lang="ts" setup>
import { onMounted, ref } from "vue";
import FontIcon from "@ui/components/font-icon.vue";

import * as version from "@utils/version";

const extensionVersion = "2.0.5"; // __VERSION__;

const latestVersion = ref(version.full(__VERSION__));
const updateAvailable = ref(false);

async function getLatestVersion(): Promise<string> {
    const url = new URL("https://raw.githubusercontent.com");
    url.pathname = new URL(__HOMEPAGE__).pathname + "/main/package.json";

    const res = await fetch(url.toString());
    const json = await res.json();

    logging.debug("Package.json url:", url.toString());
    logging.debug("Package.json:", json);

    latestVersion.value = json.version;
    return json.version;
}

async function updateCheck() {
    const latest = await getLatestVersion();
    const current = "2.0.5"; //__VERSION__;

    logging.debug("Current version:", current);
    logging.debug("Latest version:", latest);

    return version.compare(latest, current) > 0;
}

function click() {
    chrome.tabs.create({
        url: __HOMEPAGE__ + "/releases",
    });
}

onMounted(async () => {
    updateAvailable.value = await updateCheck();
    console.log(latestVersion);
});
</script>

<template>
    <div class="version">
        <FontIcon
            v-if="updateAvailable"
            :data-version="latestVersion"
            class="warning"
            icon="attention"
            size="0.8rem"
            @click="click"
        />
        <span>v{{ extensionVersion }}</span>
    </div>
</template>

<style lang="css" scoped>
.version {
    display: flex;
    align-items: center;
    justify-content: center;
}

.warning {
    position: relative;
    color: var(--yellow);
    transform: translateX(-50%);
    cursor: pointer;
}

.warning:hover::after {
    content: "New version available v" attr(data-version);
    position: absolute;
    bottom: 100%;
    right: 100%;
    text-align: right;
    color: var(--color);
    background-color: var(--item);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 5px;
    translate: translateX(-50%);
    font-size: 0.8rem;
    width: max-content;
}
</style>
