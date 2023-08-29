<script lang="ts" setup>
import type { Control } from "./control.vue";

withDefaults(
    defineProps<{
        controls: Control[];
        horizontal?: boolean;
    }>(),
    {
        controls: () => []
    }
);
</script>

<template>
    <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <Control
            v-for="control in controls"
            :key="control.name"
            :control="control"
        />
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped></style>
