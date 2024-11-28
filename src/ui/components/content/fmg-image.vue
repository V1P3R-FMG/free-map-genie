<script lang="ts" setup>
import { onMounted, ref } from "vue";
import channel from "@shared/channel/content";

const props = defineProps<{
    src: string;
}>();

const fullSrc = ref<string>("");

onMounted(async () => {
    fullSrc.value = await channel.extension.getAsset({ path: props.src });
});
</script>

<template>
    <img :src="fullSrc" />
</template>
