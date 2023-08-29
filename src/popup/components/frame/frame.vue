<script lang="ts" setup>
import Icon from "@components/icon.vue";
import { onMounted, ref, reactive, watch } from "vue";
const $pages = ref<HTMLDivElement>();
const $tabs = ref<HTMLDivElement>();
const tabs = reactive<
    {
        name: string;
        icon: string;
    }[]
>([]);

const props = defineProps<{
    page: string;
}>();

const curPage = ref(props.page);

function updatePage() {
    if (!$pages.value) return;
    for (const page of $pages.value.children) {
        page.getAttribute("name") === curPage.value
            ? ((page as HTMLDivElement).style.display = "block")
            : ((page as HTMLDivElement).style.display = "none");
    }
    if (!$tabs.value) return;
    for (const tab of $tabs.value.children) {
        tab.getAttribute("name") === curPage.value
            ? (tab as HTMLDivElement).classList.add("active")
            : (tab as HTMLDivElement).classList.remove("active");
    }
}

watch(
    () => props.page,
    () => {
        curPage.value = props.page;
        updatePage();
    }
);

onMounted(() => {
    if ($pages.value) {
        for (const page of $pages.value.children) {
            tabs.push({
                name: page.getAttribute("name") ?? "",
                icon: page.getAttribute("icon") ?? ""
            });
        }
    }
    updatePage();
});

function changePage(page: string) {
    curPage.value = page;
    updatePage();
}
</script>

<template>
    <div class="frame">
        <div class="frame-tabs" ref="$tabs">
            <h4
                :name="tab.name"
                class="frame-tab"
                v-for="tab in tabs"
                @click="changePage(tab.name)"
                :class="curPage === tab.name ? 'active' : ''"
            >
                <Icon v-if="!!tab.icon" :icon="tab.icon" size="0.75em"></Icon>
                <span v-else>{{ tab.name }}</span>
            </h4>
        </div>
        <div class="frame-pages" ref="$pages">
            <slot></slot>
        </div>
    </div>
</template>

<style>
.frame {
    margin: 0 5px;
    /* border: 2px solid var(--border); */
    border-radius: 5px;
}

.frame-tabs {
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 5px;
    gap: 5px;
    border-bottom: 1px solid var(--border);
}

.frame-tab {
    background-color: var(--item);
    border: 1px solid var(--item);
    border-radius: 5px;
    padding: 5px;
    margin: 0;
}

.frame-tab:hover {
    border-color: var(--active);
    box-sizing: border-box;
}

.frame-tab.active {
    color: var(--active);
}

.frame-pages {
    padding: 5px 0;
    background-color: var(--page);
    border-radius: 5px;
}
</style>
