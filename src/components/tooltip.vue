<script lang="ts" setup>
import { ref } from "vue";
import Icon from "./icon.vue";

const $div = ref<HTMLDivElement>();

defineProps<{
    tooltip: string;
    top?: boolean;
}>();

function tooltipHover(mouseover: boolean) {
    if (mouseover) {
        $div.value?.classList.add("hover");
    } else {
        $div.value?.classList.remove("hover");
    }
}
</script>

<template>
    <div
        :class="'tooltip ' + (top ? 'top' : '')"
        :data-tooltip="tooltip"
        ref="$div"
    >
        <div class="tooltip-container">
            <slot></slot>
        </div>
        <Icon
            icon="info-circled"
            size="14px"
            @mouseover="tooltipHover(true)"
            @mouseout="tooltipHover(false)"
        ></Icon>
    </div>
</template>

<style lang="scss" scoped>
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
