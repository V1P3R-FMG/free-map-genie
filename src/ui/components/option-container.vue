<script lang="ts" setup>
export interface Props {
    type: string;
}

defineProps<Props>();
</script>

<template>
    <div class="option" :type="type">
        <slot></slot>
    </div>
</template>

<style lang="css" scoped>
.option {
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin: 5px;
    background: var(--item);
}
</style>
