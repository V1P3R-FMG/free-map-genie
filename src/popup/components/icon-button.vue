<script lang="ts" setup>
import Icon from "./icon.vue";
import { ref, watch } from "vue";

export interface Props {
    icon: string;
    title: string;
    size?: string;
    toggle?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "toggle", value: boolean): void;
}>();

const toggled = ref(false);

watch(
    () => props.toggle,
    () => {
        toggled.value = false;
        emit("toggle", toggled.value);
    }
);

function toggleButton() {
    if (!props.toggle) return;
    toggled.value = !toggled.value;
    emit("toggle", toggled.value);
}
</script>

<template>
    <button
        :class="
            (toggle ? 'icon-toggle-button' : 'icon-button') +
            (toggled ? ' toggled' : '') +
            (' ' + title)
        "
        :title="title"
        @click="toggleButton"
    >
        <Icon :icon="icon" :size="size" />
    </button>
</template>

<style lang="scss" scoped>
.icon-button,
.icon-toggle-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    outline: none;
    color: inherit;
}

.icon-button:hover,
.icon-toggle-button.toggled {
    color: var(--active);
}
</style>
