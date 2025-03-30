<script lang="ts" setup>
import { toRef, computed } from "vue";
import Button from "./button.vue";
import type { State } from "@content/index";

export interface Props {
    state: State;
}


const props = defineProps<Props>();
defineEmits(["import", "export", "clear", "import-mg-account"]);


const state = toRef(props, "state");

const disabled = computed(() => {
    return state.value.type !== 'map' || state.value.user === "null"
});

const importAccountDisabled = computed(() => {
    return disabled.value || state.value.user === "-1";
});
</script>

<template>
    <div class="data-controls">
        <Button :disabled="disabled" class="btn" icon="upload" text="Import" @click="$emit('import')" />
        <Button :disabled="disabled" class="btn" icon="download" text="Export" @click="$emit('export')" />
        <Button :disabled="disabled" class="btn" icon="trash" text="Clear" @click="$emit('clear')" />
    </div>
    <div class="data-controls">
        <Button :disabled="importAccountDisabled" class="btn" icon="" text="Import Mapgenie Account" @click="$emit('import-mg-account')" />
    </div>
</template>

<style lang="scss" scoped>
.data-controls {
    display: flex;
    // grid-template-columns: repeat(3, 1fr);
    flex-direction: row;
    gap: 5px;
    margin: 10px;
}

.btn {
    width: 100%;
}
</style>
