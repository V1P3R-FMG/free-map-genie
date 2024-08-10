<script lang="ts" setup>
export interface Props {
    icon: string;
    size?: string;
}

defineProps<Props>();
</script>

<template>
    <i :class="'fmg-icon-' + icon" :style="size ? { fontSize: size } : {}"></i>
</template>

<style lang="css" scoped>
i[class^="fmg-icon-"] {
    font-size: 1rem;
}

i[class^="fmg-icon-"]:before,
i[class*=" fmg-icon-"]:before {
    font-size: inherit;
}
</style>
