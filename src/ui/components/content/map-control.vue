<script lang="ts" setup>
defineProps<{
    id: string;
    title: string;
}>();

defineEmits<{
    click: [];
}>();
</script>

<template>
    <div class="mapboxgl-ctrl mg-map-control" :id="id" data-placement="left" :title="title" @click="$emit('click')">
        <slot />
    </div>
</template>
