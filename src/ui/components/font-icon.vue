<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
    icon: string;
    size?: string;
    color?: string;
    textStroke?: string;
    textShadow?: string;
    margin?: string;
}

const props = defineProps<Props>();

const style = computed(() =>
    Object.assign(
        {},
        props.size ? { fontSize: props.size } : {},
        props.textStroke ? { "text-stroke": props.textStroke } : {},
        props.textShadow ? { "text-shadow": props.textShadow } : {},
        props.color ? { color: props.color } : {},
        props.margin ? { margin: props.margin } : {}
    )
);

defineEmits<{
    click: [MouseEvent];
}>();
</script>

<template>
    <i class="font-icon" :class="{ ['fmg-icon-' + icon]: true }" :style="style" @click="$emit('click', $event)"></i>
</template>

<style lang="css" scoped>
.font-icon {
    font-size: 1rem;
}

.font-icon:before,
.font-icon:before {
    font-size: inherit;
}
</style>
