<script lang="ts" setup>
import IconButton from "@popup/components/icon-button.vue";

const props = defineProps<{
    isTemplate?: boolean;
    data?: FMG.Extension.BookmarkData;
    trash?: boolean;
}>();

const emit = defineEmits<{
    (e: "remove-bookmark", url: string): void;
}>();

function click(e: MouseEvent) {
    if (props.isTemplate || !props.data || props.trash) return;
    if (e.ctrlKey) {
        chrome.tabs.create({ url: props.data?.url });
    } else {
        chrome.tabs.update({ url: props.data?.url });
    }
    window.close();
}
</script>

<template>
    <div class="bookmark" :class="trash ? '' : 'enabled'">
        <img
            v-if="!isTemplate"
            :src="data?.favicon"
            :alt="data?.title"
            :title="data?.title"
            @click="click"
            :draggable="false"
        />
        <div v-else class="bookmark-template">
            <h1>+</h1>
        </div>
        <div class="trash-button" v-if="!isTemplate && trash">
            <IconButton icon="trash" title="trash-bookmark" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.bookmark {
    display: grid;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--border);
    background-color: var(--item);
    width: 50px;
    height: 50px;
}

.bookmark,
.bookmark img,
.trash-button {
    border-radius: 5px;
}

.bookmark.enabled:hover {
    border-color: var(--active);
}

.bookmark img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    -webkit-user-select: none;
    user-select: none;
}

.bookmark .trash-button,
.bookmark img {
    grid-column: 1;
    grid-row: 1;
}

.trash-button {
    background-color: #00000080;
}

.trash-button,
.bookmark-template {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.bookmark-template {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-user-select: none;
    user-select: none;
}

.bookmark-template h1 {
    margin: 0;
    line-height: 1;
}
</style>
