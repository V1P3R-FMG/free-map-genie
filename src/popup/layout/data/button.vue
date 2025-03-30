<script lang="ts" setup>
import Icon from "@components/icon.vue";

defineProps<{
    icon: string;
    text: string;
    disabled?: boolean;
}>();
</script>

<template>
    <button class="button" :disabled="disabled">
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

    &:hover:not(:disabled) {
        border-color: var(--active);
    }

    &:disabled {
        opacity: 0.5;
    }
}

h4 {
    margin: 0;
}
</style>
