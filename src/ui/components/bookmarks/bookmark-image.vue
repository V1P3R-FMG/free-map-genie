<script lang="ts" setup>
import { computed, toRef } from "vue";
import type { BookmarkData } from "./bookmark-button.vue";

export interface Props {
    data: BookmarkData;
}

const props = defineProps<Props>();

const bookmark = toRef(props, "data");

const icon = computed(() => {
    switch (bookmark.value.type) {
        case "map":
            return bookmark.value.icon;
        case "game-home":
            return bookmark.value.icon || chrome.runtime.getURL("assets/images/home.png");
        case "guide":
            return bookmark.value.icon || chrome.runtime.getURL("assets/images/checklist.png");
        default:
            logging.error(`Unexpected bookmark type: ${bookmark.value["type"]}.`);
            return "";
    }
});
</script>

<template>
    <div class="bookmark-image">
        <img
            v-if="data"
            class="bookmark-preview"
            :src="data.preview ?? icon"
            :alt="data.title"
            :title="data.title"
            @click="$emit('click', $event, data)"
            @auxclick="$emit('click', $event, data)"
            :draggable="false"
        />
        <img class="bookmark-icon" v-if="data?.preview" :src="icon" />
    </div>
</template>

<style lang="css" scoped>
.bookmark-image {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: 55% 45%;
    grid-template-rows: 55% 45%;
    -webkit-user-select: none;
    user-select: none;
}

.bookmark-preview {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
}

.bookmark-icon {
    grid-column: 2;
    grid-row: 2;
}

.bookmark-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    -webkit-user-select: none;
    user-select: none;
    border-radius: 5px;
}

.bookmark-icon {
    width: 100%;
    height: 100%;
    border-bottom-right-radius: 5px;
    border-top-left-radius: 5px;
    box-shadow: -1px -1px 3px 2px rgba(0, 0, 0, 0.712);
}
</style>
