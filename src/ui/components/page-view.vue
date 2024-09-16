<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
    name: string;
    icon: string;
}

const props = defineProps<Props>();

const id = computed(() => `page-${props.name}`);
</script>

<template>
    <div class="page-view" :id :icon :name>
        <slot></slot>
    </div>
</template>

<style scoped>
.page-view {
    opacity: 0;
    pointer-events: none;
}

.page-view.active {
    opacity: 1;
    pointer-events: all;
}
</style>
