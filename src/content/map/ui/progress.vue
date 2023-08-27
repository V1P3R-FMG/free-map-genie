<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";

const total = ref(0);
const marked = ref(0);
const percent = ref(100);

const props = defineProps<{
    calculateTotal: () => [number, number];
}>();

watch([total, marked], () => {
    if (total.value === 0 && marked.value === 0) {
        percent.value = 100;
        return;
    }
    percent.value = (marked.value / total.value) * 100;
});

function update() {
    const [_total, _marked] = props.calculateTotal();
    total.value = _total;
    marked.value = _marked;
}

onMounted(() => {
    update();
});

defineExpose({
    update
});
</script>

<template>
    <div class="progress-item-wrapper" style="margin-right: 10px">
        <div class="progress-item">
            <span class="title">{{ +percent.toFixed(2) + "%" }}</span>
            <span class="counter">{{ marked }} / {{ total }}</span>
            <div class="progress-bar-container">
                <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: percent + '%' }"
                ></div>
            </div>
        </div>
    </div>
</template>
