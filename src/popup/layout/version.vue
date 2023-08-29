<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Icon from "@components/icon.vue";

const props = defineProps<{
    version: string;
}>();

async function getLatestVersion(): Promise<string> {
    const url = new URL("https://raw.githubusercontent.com");
    url.pathname = new URL(__HOMEPAGE__).pathname + "/main/package.json";
    const res = await fetch(url.toString());
    const json = await res.json();
    logger.debug("Package.json url:", url.toString());
    logger.debug("Package.json:", json);
    return json.version;
}

function compareVersions(a: string, b: string): number {
    const [aParts, bParts] = [a, b].map((v) =>
        v.split(".").map((p) => parseInt(p.match(/\d+/)?.[0] || "0"))
    );
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart > bPart) return 1;
        if (aPart < bPart) return -1;
    }
    return 0;
}

async function updateCheck() {
    const latest = await getLatestVersion();
    const current = props.version;
    logger.debug("Current version:", current);
    logger.debug("Latest version:", latest);
    return compareVersions(latest, current) > 0;
}

function click() {
    chrome.tabs.create({
        url: __HOMEPAGE__ + "/releases"
    });
}

const updateAvailable = ref(false);

onMounted(async () => {
    updateAvailable.value = await updateCheck();
});
</script>

<template>
    <div class="version">
        <Icon
            v-if="updateAvailable"
            class="warning"
            icon="attention"
            size="0.6rem"
            @click="click"
        />
        <span>v{{ version }}</span>
    </div>
</template>

<style lang="scss" scoped>
.version {
    display: flex;
    align-items: center;
    justify-content: center;
}
.warning {
    position: relative;
    color: var(--yellow);
}

.warning:hover::after {
    content: "New version available";
    position: absolute;
    bottom: 100%;
    right: 100%;
    text-align: right;
    color: var(--color);
    background-color: var(--item);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 5px;
    translate: transform(-50%, 0);
    font-size: 0.8rem;
    width: max-content;
}
</style>
