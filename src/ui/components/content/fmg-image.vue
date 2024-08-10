<script lang="ts" setup>
import { onMounted, ref } from "vue";

import assetsChannel from "@content/channels/assets.channel";

const props = defineProps<{
    src: string;
}>();

const fullSrc = ref<string>("");

onMounted(async () => {
    fullSrc.value = await assetsChannel.getAsset(props.src);
});
</script>

<template>
    <img :src="fullSrc" />
</template>
