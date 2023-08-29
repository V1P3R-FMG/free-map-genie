<script lang="ts" setup>
import "@css/fmg-font.css";

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
i[class^="icon-"] {
    font-size: 1rem;
}

i[class^="icon-"]:before,
i[class*=" icon-"]:before {
    font-size: inherit;
    // color: red;
}
</style>
