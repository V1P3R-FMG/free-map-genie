<script lang="ts" setup>
import Icon from "@components/icon.vue";

defineProps<{
    icon: string;
    text: string;
}>();
</script>

<template>
    <button class="button">
        <Icon :icon="icon" />
        <h4>{{ text }}</h4>
    </button>
</template>

<style lang="scss" scoped>
.button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    border-radius: 5px;
    background-color: var(--item);
    color: var(--color-text);
    border: 1px solid var(--border);
    text-align: center;
    transition: background-color 0.2s ease-in-out;
    &:hover {
        border-color: var(--active);
    }
}

h4 {
    margin: 0;
}
</style>
