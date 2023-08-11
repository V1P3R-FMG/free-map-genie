<script lang="ts" setup>
import Icon from "./icon.vue";

export interface Props {
    icon: string;
    text: string;
    title: string;
}

defineProps<Props>();
</script>

<template>
    <button>
        <Icon :icon="icon" />
        <span>{{ text }}</span>
    </button>
</template>
