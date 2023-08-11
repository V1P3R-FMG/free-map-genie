<script lang="ts" setup>
import { ref, watch } from "vue";
import OptionBase from "./option-base.vue";
import Tooltip from "../../../components/tooltip.vue";

const props = defineProps<{
    name: string;
    label: string;
    tooltip: string;
    value?: boolean;
}>();

const checked = ref(props.value || false);

function click(this: typeof self, e: MouseEvent) {
    const input = e.target as HTMLInputElement;
    checked.value = input.checked;
    emit("change", checked.value);
}

watch(
    () => props.value,
    (value) => {
        checked.value = value;
    }
);

defineExpose({
    checked
});

const emit = defineEmits<{
    (e: "change", value: boolean): void;
}>();
</script>

<template>
    <OptionBase type="checkbox">
        <Tooltip :tooltip="tooltip">
            <div class="content">
                <div class="toggle-button-cover">
                    <div class="button r">
                        <input
                            class="checkbox"
                            type="checkbox"
                            :id="name"
                            ref="checkbox"
                            :checked="checked"
                            :value="checked"
                            @click="click"
                        />
                        <div class="knobs"></div>
                        <div class="layer"></div>
                    </div>
                </div>
                <span>{{ label }}</span>
            </div>
        </Tooltip>
    </OptionBase>
</template>

<style lang="scss" scoped>
.content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.toggle-button-cover {
    display: flex;
    position: relative;
    width: 40px;
    height: 5px;
    margin: 15px 10px;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
}

.button-cover,
.knobs,
.layer {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
}

.button {
    position: relative;
    width: 100%;
    height: 18px;
}

.button.r,
.button.r .layer {
    border-radius: 100px;
}

.checkbox {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 3;
}

.knobs {
    z-index: 2;
}

.layer {
    width: 100%;
    top: 2px;
    height: calc(100% - 4px);
    background-color: var(--checkbox);
    transition: 0.3s ease all;
    z-index: 1;
}

/* Button 3 */
.button .knobs:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0%;
    aspect-ratio: 1;
    height: 100%;
    width: auto;
    line-height: 1;
    background-color: var(--checkbox-text);
    border-radius: 50%;
    transform: translateY(-50%);
    transition:
        0.3s ease all,
        left 0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15);
}

.button .checkbox:checked + .knobs:before {
    content: "";
    left: calc(80%);
    transform: translate(-50%, -50%);
    background-color: var(--active);
}

// .button .checkbox:checked ~ .layer {
// 	background-color: rgba(255, 255, 255, 0.15);
// }
</style>
