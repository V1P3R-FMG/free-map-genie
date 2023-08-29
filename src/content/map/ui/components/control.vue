<script lang="ts" setup>
import Icon from "@components/icon.vue";

export interface Control {
    name: string;
    icon: string;
    disabled?: boolean;
}

defineProps<{
    control: Control;
}>();
</script>

<template>
    <button
        class="mapboxgl-ctrl-compass"
        type="button"
        :title="control.name"
        :aria-label="control.name"
        :aria-disabled="control.disabled ?? false"
    >
        <Icon :icon="control.icon" size="24px" class="fmg-control-icon" />
    </button>
</template>

<style lang="scss" scoped>
.fmg-control-icon {
    color: #333;
}
</style>
