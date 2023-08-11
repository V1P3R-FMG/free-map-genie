<script lang="ts" setup>
import { ref } from "vue";
import Icon from "./icon.vue";

const $div = ref<HTMLDivElement>();

defineProps<{
    tooltip: string;
}>();

function tooltipHover(mouseover: boolean) {
    console.log($div.value);
    if (mouseover) {
        $div.value?.classList.add("hover");
    } else {
        $div.value?.classList.remove("hover");
    }
}
</script>

<template>
    <div class="tooltip" :data-tooltip="tooltip" ref="$div">
        <div class="tooltip-container">
            <slot></slot>
        </div>
        <Icon
            icon="info-circled"
            size="0.7em"
            @mouseover="tooltipHover(true)"
            @mouseout="tooltipHover(false)"
        ></Icon>
    </div>
</template>

<style lang="scss" scoped>
.tooltip {
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
    width: calc(100% - 5px);
    left: 0;
    bottom: 0;
    z-index: 20;
    padding: 10px;
    pointer-events: none;
    transform: translate(0, 100%);
}
</style>
