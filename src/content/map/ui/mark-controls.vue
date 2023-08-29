<script lang="ts" setup>
import Control from "./components/control.vue";
import ControlGroup from "./components/control-group.vue";
import type { FMG_MapManager } from "@fmg/map-manager";

const { mapManager } = defineProps<{
    mapManager: FMG_MapManager;
}>();

const markAll = (found: boolean) => {
    mapManager.storage.data.autosave = false;
    mapManager.getCurrentCategories().forEach((category) => {
        if (category.visible) {
            const locations =
                category.locations ||
                mapManager.store.getState().map.locationsByCategory[
                    category.id
                ];
            locations.forEach((location) => {
                mapManager.markLocationFound(location.id, found);
                if (found) {
                    mapManager.storage.data.locations[location.id] = true;
                } else {
                    delete mapManager.storage.data.locations[location.id];
                }
            });
        }
    });
    mapManager.storage.data.autosave = true;
    mapManager.storage.save();
    mapManager.fire("fmg-update");
    mapManager.store.updateCategories();
};
</script>

<template>
    <ControlGroup>
        <Control
            :control="{
                name: 'Mark All',
                icon: 'plus-squared',
                disabled: false
            }"
            @click="markAll(true)"
        />
        <Control
            :control="{
                name: 'Unmark All',
                icon: 'cancel-squared',
                disabled: false
            }"
            @click="markAll(false)"
        />
    </ControlGroup>
</template>
