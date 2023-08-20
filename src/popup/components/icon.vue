<script lang="ts" setup>
import "../css/fmg-font.css";
import "../css/animation.css";

export interface Props {
    icon: string;
    size?: string;
}

defineProps<Props>();
</script>

<template>
    <i :class="'icon-' + icon" :style="size ? { fontSize: size } : {}"></i>
</template>

<style lang="scss" scoped>
i[class^="icon-"]:before,
i[class*=" icon-"]:before {
    font-size: 1.5em;
    // color: red;
}
</style>
