<script lang="ts" setup>
import "../themes/*.css";
import { watch, ref } from "vue";

export interface Props {
    theme: string;
}

const props = defineProps<Props>();

const currentTheme = ref("auto");

watch(
    () => props.theme,
    (theme) => {
        currentTheme.value = theme;
    }
);

function updateTheme() {
    if (currentTheme.value === "auto") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        currentTheme.value = isDark ? "dark" : "light";
    }
}

window.matchMedia("(prefers-color-scheme: dark)").onchange = updateTheme;

updateTheme();

function setTheme(theme: string) {
    currentTheme.value = theme;
}

defineExpose({
    setTheme: setTheme,
});
</script>

<template>
    <div class="theme-provider" :theme="currentTheme">
        <slot></slot>
    </div>
</template>

<style lang="css" scoped>
.theme-provider {
    margin: 0;
    padding: 0;
}
</style>
