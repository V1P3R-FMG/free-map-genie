<script lang="ts" setup>
import MapControl from "./components/map-control.vue";
import FmgImage from "./components/fmg-image.vue";

defineEmits<{
    click: [];
}>();
</script>

<template>
    <MapControl id="fmg-map-control" title="Open fmg control panel" @click="$emit('click')">
        <FmgImage src="icons/128.png" style="width: calc(100% - 10px); height: calc(100% - 10px); margin: 5px" />
    </MapControl>
</template>
