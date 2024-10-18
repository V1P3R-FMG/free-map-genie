<script lang="ts" setup>
import { toRef } from "vue";

export interface Props {
    icon: string;
    style?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
    style: () => ({}),
});

const style = toRef(props, "style");

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
