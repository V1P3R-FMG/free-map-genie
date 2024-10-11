<script lang="ts" setup>
import "../themes/*.css";
import { toRef, computed, ref, watch } from "vue";

import * as string from "@utils/string";

export type ThemeName = "dark" | "light";

export interface Theme {
    active?: string;
}

export interface Props {
    theme: ThemeName | "auto";
    modify: Theme;
}

const props = defineProps<Props>();
const theme = toRef(props, "theme");
const modify = toRef(props, "modify");

const activeTheme = ref(updateTheme());

const style = computed(() => {
    return Object.entries(modify.value)
        .map(([k, v]) => `--${string.kebabCase(k)}: ${v}`)
        .join(";");
});

function updateTheme(): ThemeName {
    if (theme.value === "auto") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "dark" : "light";
    }
    return theme.value;
}

window.matchMedia("(prefers-color-scheme: dark)").onchange = () => {
    activeTheme.value = updateTheme();
};

function setTheme(name: ThemeName) {
    activeTheme.value = name;
}

function setModify(theme: Theme) {
    modify.value = theme;
}

function getTheme() {
    return activeTheme.value;
}

const emit = defineEmits<{
    changed: [ThemeName];
}>();

watch(theme, () => (activeTheme.value = updateTheme()));
watch(activeTheme, (t) => emit("changed", t));

defineExpose({
    setTheme,
    setModify,
    getTheme,
});
</script>

<template>
    <div :style="style" class="theme-provider" :theme="activeTheme">
        <slot></slot>
    </div>
</template>

<style lang="css" scoped>
.theme-provider {
    margin: 0;
    padding: 0;
}
</style>
