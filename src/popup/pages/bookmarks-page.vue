<script lang="ts" setup>
import { ref, onBeforeMount } from "vue";
import bus from "@popup/bus";

import PageView from "@ui/components/page-view.vue";
import BookmarkContainer, { type BookmarkData } from "@ui/components/bookmarks/bookmark-container.vue";
import FontIcon from "@ui/components/font-icon.vue";

import channel from "popup/channel";

const bookmarks = ref<BookmarkData[]>([]);
const trashing = ref(false);

async function addBookmark(_e: MouseEvent) {
    try {
        bookmarks.value = await channel.addBookmark();
    } catch (err) {
        bus.$emit("alert-error", `${err}`);
    }
}

async function removeBookmark(_e: MouseEvent, bookmark: BookmarkData) {
    try {
        bookmarks.value = await channel.removeBookmark(bookmark);
    } catch (err) {
        bus.$emit("alert-error", `${err}`);
    }
}

async function openBookmark(e: MouseEvent, { url }: BookmarkData) {
    if (e.button === 1 || e.ctrlKey) {
        chrome.tabs.create({ url });
    } else {
        chrome.tabs.update({ url });
    }
    window.close();
}

onBeforeMount(async () => {
    try {
        bookmarks.value = await channel.getBookmarks();
    } catch (err) {
        bus.$emit("alert-error", `${err}`);
    }
});
</script>

<template>
    <PageView name="bookmarks" icon="bookmark">
        <div class="action-bar">
            <button class="trash-button" :class="{ active: trashing }" @click="trashing = !trashing">
                <FontIcon icon="trash" />
            </button>
        </div>
        <BookmarkContainer
            :trashing="trashing"
            :bookmarks="bookmarks"
            @add="addBookmark"
            @remove="removeBookmark"
            @open="openBookmark"
        />
    </PageView>
</template>

<style lang="css" scoped>
.action-bar {
    display: grid;
    width: 100%;
    grid-template-columns: calc(100% - 30px) 30px;
    justify-content: center;
    align-items: center;
}

.trash-button {
    background-color: transparent;
    border-style: none;
    color: var(--color);
    grid-column: 2;
    padding: 5px;
}

.trash-button.active {
    color: var(--active);
}
</style>
