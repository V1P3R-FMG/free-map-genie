<script lang="ts" setup>
import Container from "./container.vue";
import Checkbox from "./fields/checkbox.vue";

import { watch, ref } from "vue";

export interface Props {
    options: FMG.Extension.Option[];
    settings: FMG.Extension.Settings;
}

const props = defineProps<Props>();

const curSettings = ref<FMG.Extension.Settings>(props.settings);

watch(
    () => props.settings,
    (value) => {
        curSettings.value = value;
    }
);

defineEmits<{
    (e: "change", name: string, value: any): void;
}>();
</script>

<template>
    <div class="settings">
        <Container v-for="(option, i) in options">
            <Checkbox
                v-if="option.type === 'checkbox'"
                :label="option.label"
                :tooltip="option.tooltip"
                :tooltip-top="i === options.length - 1"
                :name="option.name"
                :value="
                    curSettings[option.name as keyof FMG.Extension.Settings]
                "
                @change="$emit('change', option.name, $event)"
            />
        </Container>
    </div>
</template>
