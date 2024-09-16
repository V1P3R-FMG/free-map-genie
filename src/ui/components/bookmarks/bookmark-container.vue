<script lang="ts">
export { type BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";
</script>

<script lang="ts" setup>
import { toRef } from "vue";
import BookmarkButton, { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

export interface Props {
    trashing?: boolean;
    bookmarks: BookmarkData[];
}

const props = withDefaults(defineProps<Props>(), {
    trashing: true,
});

const trashing = toRef(props, "trashing");

defineEmits<{
    open: [MouseEvent, BookmarkData];
    remove: [MouseEvent, BookmarkData];
    add: [MouseEvent];
}>();
</script>

<template>
    <div class="bookmarks-list">
        <BookmarkButton
            v-for="bookmark in bookmarks"
            :key="bookmark.url"
            :data="bookmark"
            @click="(e) => $emit('open', e, bookmark)"
            @remove="(e) => $emit('remove', e, bookmark)"
            :trash="trashing"
        />
        <BookmarkButton @click="(e) => $emit('add', e)" :is-add="true" />
    </div>
</template>

<style lang="css">
.bookmarks-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}
</style>
