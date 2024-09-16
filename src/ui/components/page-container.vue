<script lang="ts" setup>
import { onMounted, ref, reactive, toRef } from "vue";

import FontIcon from "@ui/components/font-icon.vue";

interface Tab {
    name: string;
    icon: string;
}

const $pages = ref<HTMLDivElement>();
const $tabs = ref<HTMLDivElement>();

const tabs = reactive<Tab[]>([]);

const props = defineProps<{
    page: string;
}>();

const curPage = toRef(props.page);

function updatePage() {
    if ($pages.value) {
        for (const page of $pages.value.children) {
            page.classList.toggle("active", page.getAttribute("name") === curPage.value);
        }
    }
    if ($tabs.value) {
        for (const tab of $tabs.value.children) {
            tab.classList.toggle("active", tab.getAttribute("name") === curPage.value);
        }
    }
}

onMounted(() => {
    if (!$pages.value) throw "Failed to initialize tabs.";
    for (const page of $pages.value.children) {
        tabs.push({
            name: page.getAttribute("name") ?? "",
            icon: page.getAttribute("icon") ?? "",
        });
    }
    updatePage();
});

function changePage(page: string) {
    curPage.value = page;
    updatePage();
}
</script>

<template>
    <div class="page-container">
        <div class="page-container-tabs" ref="$tabs">
            <h4
                v-for="tab in tabs"
                :key="tab.name"
                :name="tab.name"
                class="page-container-tab"
                :class="{ active: curPage === tab.name }"
                @click="changePage(tab.name)"
            >
                <FontIcon
                    class="page-container-tab-icon"
                    :icon="tab.icon"
                    size="18px"
                    :color="curPage === tab.name ? 'var(--active)' : 'var(--color)'"
                ></FontIcon>
            </h4>
        </div>
        <div class="page-container-pages" ref="$pages">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.page-container {
    margin: 0 5px;
    /* border: 2px solid var(--border); */
    border-radius: 5px;
}

.page-container-tabs {
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 5px;
    gap: 5px;
    border-bottom: 1px solid var(--border);
}

.page-container-tab {
    background-color: var(--item);
    border: 1px solid var(--item);
    border-radius: 5px;
    padding: 5px 5px;
    margin: 0;
}

/* .page-container-tab-icon {
    margin-top: 5px;
} */

.page-container-tab:hover {
    border-color: var(--active);
    box-sizing: border-box;
}

.page-container-tab.active {
    color: var(--active);
}

.page-container-pages {
    display: grid;
    padding: 5px 0;
    background-color: var(--page);
}

.page-container-pages > * {
    grid-column: 1;
    grid-row: 1;
}
</style>
