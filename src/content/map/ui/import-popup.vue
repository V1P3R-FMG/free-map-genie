<script lang="ts" setup>
import { ref } from "vue";
import { FMG_ImportHelper } from "@fmg/storage/data/import";

const visible = ref(false);

function show() {
    visible.value = true;
}

function hide() {
    visible.value = false;
}

async function onImport() {
    const file = await FMG_ImportHelper.showFilePicker();

    if (!file) {
        hide();
        return;
    }

    emit("selected", file);
    hide();
}

const emit = defineEmits(["selected"]);

// const emit = defineEmits<{
//     selected(event: "selected", file: File): void
// }>();

defineExpose({
    show,
    hide
})
</script>

<template>
    <div id="import-modal" v-if="visible">
        <div class="container">
            <span class="title">Import Data</span>
            <button id="close-btn" @click="hide">X</button>
            <button id="import-btn" @click="onImport">Import</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#import-modal {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.363);
    z-index: 999;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: bold;
}

.container {
    position: absolute;
    
    display: grid;
    grid-template-columns: auto 25px;
    grid-template-rows: 25px auto;

    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 300px;
    height: 100px;

    border-radius: 5px;
    gap: 5px;
    padding: 5px;

    background: var(--sidebar-background);

    z-index: 1000;
}

button {
    border: none;

    border-radius: 2px;
    color: var(--social-icon-fill-color);
    background-color: var(--social-icon-background);

    text-align: center;
}

.title {
    margin-bottom: 5px;
    color: var(--text-color);
    text-align: center;
    grid-column: 1 / span 2;
    grid-row: 1;
}

#close-btn {
    grid-column: 2;
    grid-row: 1;
}

#import-btn {
    height: auto;
    padding: 10px;
    width: 100px;
    align-self: center;
    justify-self: center;
    grid-column: 1 / span 2;
}
</style>