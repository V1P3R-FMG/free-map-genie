<script lang="ts" setup>
export interface Props {
    name: string;
}

defineProps<Props>();
</script>

<template>
    <div class="page" :id="name + '-page'">
        <slot />
    </div>
</template>
