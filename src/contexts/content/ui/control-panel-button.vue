<script lang="ts" setup>
import MapControl from "@ui/components/content/map-control.vue";
import FmgImage from "@ui/components/content/fmg-image.vue";

defineEmits<{
    click: [];
}>();
</script>

<template>
    <MapControl id="fmg-map-control" title="Open fmg control panel" @click="$emit('click')">
        <FmgImage src="icons/128.png" style="width: calc(100% - 10px); height: calc(100% - 10px); margin: 5px" />
    </MapControl>
</template>
