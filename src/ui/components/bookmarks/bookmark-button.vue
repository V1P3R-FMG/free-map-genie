<script lang="ts" setup>
import { toRef } from "vue";
import FontIcon from "../font-icon.vue";

export interface BookmarkData {
    title: string;
    url: string;
    icon: string;
    preview?: string;
}

export type Props = {
    isAdd?: boolean;
    data?: BookmarkData;
    trash?: boolean;
};

const props = defineProps<Props>();

if (!props.isAdd && !props.data) {
    throw "Invalid props for bookmark Button expected either 'isAdd' or 'data'.";
}

defineEmits<{
    remove: [MouseEvent, BookmarkData];
    click: [MouseEvent, BookmarkData];
}>();

const trashing = toRef(props, "trash");
const dummyBookmarkData: BookmarkData = {
    title: "",
    url: "",
    icon: "",
    preview: "",
};
</script>

<template>
    <div class="bookmark" :class="trashing ? '' : 'enabled'">
        <img
            v-if="data"
            class="bookmark-preview"
            :src="data.preview ?? data.icon"
            :alt="data.title"
            :title="data.title"
            @click="$emit('click', $event, props.data!)"
            @auxclick="$emit('click', $event, props.data!)"
            :draggable="false"
        />
        <img class="bookmark-icon" v-if="data?.preview" :src="data.icon" />
        <button v-if="!data" class="bookmark-add-button" @click="$emit('click', $event, dummyBookmarkData)">
            <span>+</span>
        </button>
        <button
            v-if="data && trash"
            class="bookmark-trash-button"
            :class="{ toggled: trashing, [data!.title]: true }"
            :title="data?.title"
            @click="$emit('remove', $event, props.data!)"
        >
            <FontIcon icon="trash" size="22px" text-shadow="1px 1px 5px rgba(0,0,0,1)"></FontIcon>
        </button>
    </div>
</template>

<style lang="css" scoped>
.bookmark {
    --bookmark-size: 60px;
    --game-icon-size: 25px;

    display: grid;
    justify-content: center;
    align-items: center;
    outline: var(--border) solid 1px;
    outline-offset: 0.5px;
    background-color: var(--item);
    width: var(--bookmark-size);
    height: var(--bookmark-size);
    grid-template-columns: auto var(--game-icon-size);
    grid-template-rows: auto var(--game-icon-size);
}

.bookmark,
.bookmark-preview,
.bookmark-trash-button {
    border-radius: 5px;
}

.bookmark-icon {
    border-bottom-right-radius: 5px;
    border-top-left-radius: 5px;
    box-shadow: -1px -1px 3px 2px rgba(0, 0, 0, 0.712);
}

.bookmark.enabled:hover {
    outline-color: var(--active);
    outline-width: 2px;
}

.bookmark-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    -webkit-user-select: none;
    user-select: none;
}

.bookmark-icon {
    width: var(--game-icon-size);
    height: var(--game-icon-size);
    -webkit-user-select: none;
    user-select: none;
}

.bookmark-trash-button,
.bookmark-preview,
.bookmark-add-button {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
}

.bookmark-icon {
    grid-column: 2;
    grid-row: 2;
}

.bookmark-trash-button {
    background-color: #00000080;
}

.bookmark-trash-button,
.bookmark-add-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.bookmark-add-button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-user-select: none;
    user-select: none;
    background: none;
    border-style: none;
    color: inherit;
}

.bookmark-add-button > span {
    font-size: 1.8rem;
    /* transform: translateY(-2px); */
}

.bookmark-trash-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    outline: none;
    color: inherit;
}

.bookmark-trash-button.toggled:hover {
    color: var(--active);
}
</style>
