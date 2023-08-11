<script lang="ts" setup>
import Bookmark from "./bookmark.vue";
import IconButton from "@popup/components/icon-button.vue";
import { ref } from "vue";

export interface Props {
    bookmarks?: FMG.Extension.Bookmarks;
}

withDefaults(defineProps<Props>(), {
    bookmarks: () => []
});

defineEmits<{
    (e: "add-bookmark"): void;
    (e: "remove-bookmark", url: string): void;
}>();

const trash = ref(false);
</script>

<template>
    <div class="bookmark-actions">
        <IconButton
            icon="trash"
            title="trash-bookmarks"
            :toggle="true"
            @toggle="trash = $event"
        />
    </div>
    <div class="bookmarks">
        <Bookmark
            v-for="bookmark in bookmarks"
            :data="bookmark"
            :trash="trash"
            @click="trash ? $emit('remove-bookmark', bookmark.url) : null"
        />
        <Bookmark
            :is-template="true"
            :trash="trash"
            @click="!trash ? $emit('add-bookmark') : null"
        />
    </div>
</template>

<style lang="scss" scoped>
.bookmark-actions {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
    margin-bottom: 5px;
}

.bookmarks {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
}
</style>
