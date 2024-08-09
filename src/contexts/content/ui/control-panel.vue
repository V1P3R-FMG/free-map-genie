<script lang="ts" setup>
import { ref } from "vue";

const visible = ref(false);

function show() {
    visible.value = true;
}

function hide() {
    visible.value = false;
}

function toggle() {
    visible.value = !visible.value;
}

defineExpose({ show, hide, toggle });
</script>

<template>
    <div id="fmg-control-panel" :class="visible ? 'open' : ''">
        <h1>FMG Control Panel</h1>
    </div>
</template>

<style lang="css" scoped>
#fmg-control-panel {
    padding: 16px;
    height: 100%;
    position: relative;
    z-index: 2000;
    background-color: #181818;
    color: whitesmoke;
    transform: translate(-100%);
    transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
}

#fmg-control-panel.open {
    transform: translate(0);
}
</style>
