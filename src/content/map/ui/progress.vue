<script lang="ts" setup>
import { ref } from "vue";
import type { FMG_MapManager } from "@fmg/map-manager";

const total = ref(0);
const marked = ref(0);

function recalculate(mapManager: FMG_MapManager) {
    total.value = 0;
    marked.value = 0;
    const locByCat = mapManager.store.getState().map.locationsByCategory;
    const data = mapManager.storage.data;
    data.categoryIds.forEach((catId) => {
        const locations = locByCat[catId] ?? [];
        total.value += locations.length;
        locations.forEach((loc) => {
            if (data.locations[loc.id]) marked.value++;
        });
    });
}

function update(mapManager: FMG_MapManager) {
    recalculate(mapManager);
}

defineExpose({
    update
});
</script>

<template>
    <div class="progress-item-wrapper" style="margin-right: 10px">
        <div class="progress-item">
            <span class="title">{{
                +((marked / total) * 100).toFixed(2) + "%"
            }}</span>
            <span class="counter">{{ marked }} / {{ total }}</span>
            <div class="progress-bar-container">
                <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: (marked / total) * 100 + '%' }"
                ></div>
            </div>
        </div>
    </div>
</template>
