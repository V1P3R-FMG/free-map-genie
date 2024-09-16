<script lang="ts" setup>
import { ref } from "vue";
import bus from "@popup/bus";

import AlertMessage, { type AlertType } from "./alert-message.vue";
let idCounter = 0;
const alerts = ref<[number, AlertType, string, () => void][]>([]);

function addAlert(type: AlertType, message: string, time: number = 5000) {
    const id = idCounter++;

    const remove = () => {
        alerts.value = alerts.value.filter(([alertId]) => alertId !== id);
        if (handle) window.clearTimeout(handle);
    };

    alerts.value.push([id, type, message, remove]);

    const handle = window.setTimeout(remove, time);
}

bus.$on("alert-info", (message) => addAlert("info", message));
bus.$on("alert-warn", (message) => addAlert("warn", message));
bus.$on("alert-success", (message) => addAlert("success", message));
bus.$on("alert-error", (message) => addAlert("error", message));
</script>

<template>
    <div class="alert-container">
        <AlertMessage
            v-for="[id, type, message, remove] in alerts"
            :key="id"
            :type="type"
            :message="message"
            @remove="remove"
        />
    </div>
</template>

<style lang="css" scoped>
.alert-container {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 5px;
    right: 5px;
    margin: 5px;
    gap: 5px;
}
</style>
