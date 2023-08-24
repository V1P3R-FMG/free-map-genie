<script lang="ts" setup>
import Button from "./button.vue";

defineEmits(["import", "export", "clear"]);
</script>

<template>
    <div class="data-controls">
        <Button icon="upload" text="import" @click="$emit('import')" />
        <Button icon="download" text="export" @click="$emit('export')" />
        <Button icon="trash" text="clear" @click="$emit('clear')" />
    </div>
</template>

<style lang="scss" scoped>
.data-controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    flex-direction: column;
    gap: 5px;
}
</style>
