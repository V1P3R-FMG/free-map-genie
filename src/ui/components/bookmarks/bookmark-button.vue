<script lang="ts" setup>
import { toRef } from "vue";
import { MapgeniePageType } from "@utils/fmg-page";

import FontIcon from "../font-icon.vue";
import BookmarkImage from "./bookmark-image.vue";

export interface BaseBookmarkData {
    type: MapgeniePageType;
    title: string;
    url: string;
    icon: string;
    preview?: string;
    gameIcon: string;
}

export interface MapBookmarkData extends BaseBookmarkData {
    type: "map";
    game: string;
    gameId: number;
    map: string;
    mapId: number;
}

export interface GameBookmarkData extends BaseBookmarkData {
    type: "guide" | "game-home";
    game: string;
    gameId: number;
}

export type BookmarkData = GameBookmarkData | MapBookmarkData;

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
</script>

<template>
    <div class="bookmark" :class="trashing ? '' : 'enabled'" @click="$emit('click', $event, props.data!)">
        <BookmarkImage v-if="data" :data="data" />
        <button v-if="!data" class="bookmark-add-button">
            <span>+</span>
        </button>
        <button
            v-if="data && trash"
            class="bookmark-trash-button"
            :class="{ toggled: trashing, [data!.title]: true }"
            :title="data?.title"
            @click="$emit('remove', $event, props.data!)"
        >
            <FontIcon icon="trash" :style="{ fontSize: '22px', textShadow: '1px 1px 5px rgba(0,0,0,1)' }"></FontIcon>
        </button>
    </div>
</template>

<style lang="css" scoped>
.bookmark {
    --bookmark-size: 60px;

    display: grid;

    justify-content: center;
    align-items: center;
    outline: var(--border) solid 1px;
    outline-offset: 0.5px;
    background-color: var(--item);

    width: var(--bookmark-size);
    height: var(--bookmark-size);
}

.bookmark > * {
    grid-column: 1;
    grid-row: 1;
}

.bookmark,
.bookmark-trash-button {
    border-radius: 5px;
}

.bookmark.enabled:hover {
    outline-color: var(--active);
    outline-width: 2px;
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
