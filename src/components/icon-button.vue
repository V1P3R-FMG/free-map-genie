<script lang="ts" setup>
import Icon from "./icon.vue";
import { ref, watch } from "vue";

export interface Props {
    icon: string;
    title: string;
    size?: string;
    toggle?: boolean;
}

export type ToggleEvent = (e: "toggle", value: boolean) => void;

export type Events = ToggleEvent;

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const toggled = ref(false);

watch(
    () => props.toggle,
    () => emit("toggle", toggled.value = false)
);
</script>

<template>
    <button
        :class="
            (toggle ? 'icon-toggle-button' : 'icon-button') +
            (toggled ? ' toggled' : '') +
            (' ' + title)
        "
        :title="title"
        @click="$props.toggle && (toggled = !toggled)"
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
