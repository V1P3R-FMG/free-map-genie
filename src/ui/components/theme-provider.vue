<script lang="ts" setup>
import "../themes/*.css";
import { toRef, computed } from "vue";

import * as string from "@utils/string";

export interface Theme {
    active?: string;
}

export interface Props {
    theme: string;
    modify: Theme;
}

const props = defineProps<Props>();
const theme = toRef(props, "theme");
const modify = toRef(props, "modify");

const style = computed(() => {
    return Object.entries(modify.value)
        .map(([k, v]) => `--${string.kebabCase(k)}: ${v}`)
        .join(";");
});

function updateTheme() {
    if (theme.value === "auto") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        theme.value = isDark ? "dark" : "light";
    }
}

window.matchMedia("(prefers-color-scheme: dark)").onchange = updateTheme;

updateTheme();

function setTheme(name: string) {
    theme.value = name;
}

function setModify(theme: Theme) {
    modify.value = theme;
}

defineExpose({
    setTheme,
    setModify,
});
</script>

<template>
    <div :style="style" class="theme-provider" :theme="theme">
        <slot></slot>
    </div>
</template>

<style lang="css" scoped>
.theme-provider {
    margin: 0;
    padding: 0;
}
</style>
