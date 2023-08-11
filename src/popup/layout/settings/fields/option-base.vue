<script lang="ts" setup>
defineProps<{
    type: string;
}>();
</script>

<template>
    <div class="option" :type="type">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.option {
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin: 5px;
    background: var(--item);
}
</style>
