<script lang="ts" setup>
import { ref } from "vue";
import FontIcon from "./font-icon.vue";

const $div = ref<HTMLDivElement>();

export interface Props {
    tooltip: string;
    top?: boolean;
}

defineProps<Props>();
</script>

<template>
    <div :class="'tooltip ' + (top ? 'top' : '')" :data-tooltip="tooltip" ref="$div">
        <div class="tooltip-container">
            <slot></slot>
        </div>
        <FontIcon
            icon="info-circled"
            :style="{ fontSize: '18px' }"
            @mouseover="$div?.classList.add('hover')"
            @mouseout="$div?.classList.remove('hover')"
        ></FontIcon>
    </div>
</template>

<style lang="css" scoped>
.tooltip {
    position: relative;
    padding: 2px;
    margin-right: 5px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.tooltip.hover::after {
    content: attr(data-tooltip);
    position: absolute;
    background: var(--tooltip);
    border-radius: 5px;
    width: calc(100% - 10px);
    left: 0;
    z-index: 20;
    padding: 5px;
    pointer-events: none;
    border: 1px solid var(--border);
}

.tooltip.hover:not(.top)::after {
    bottom: 0;
    transform: translateY(100%);
}

.tooltip.hover.top::after {
    top: 0;
    transform: translateY(-100%);
}
</style>
