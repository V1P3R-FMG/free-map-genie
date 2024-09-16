<script lang="ts" setup>
import FontIcon from "@ui/components/font-icon.vue";

export type AlertType = "info" | "warn" | "success" | "error";

export interface Props {
    type: AlertType;
    message: string;
}

const colors: Record<AlertType, string> = {
    info: "#033c75",
    warn: "#684309",
    success: "#004218",
    error: "#490507",
};

defineProps<Props>();

defineEmits<{
    remove: [];
}>();
</script>

<template>
    <div class="alert" :class="{ [type]: true }" ref="div">
        <FontIcon :icon="type" :color="colors[type]" />
        <span>{{ message }}</span>
        <FontIcon icon="cross" :color="colors[type]" size="0.8rem" @click="$emit('remove')" />
    </div>
</template>

<style lang="css" scoped>
.alert {
    overflow: hidden;
    display: grid;
    grid-template-columns: 20px auto 10px;
    padding: 5px;
    padding-right: 8px;
    border-radius: 10px;
    border: 1px solid;
    font-weight: 500;
    font-size: 0.8rem;
    width: 350px;
    box-shadow: 2px 2px 5px 2px #0000009c;
}

.alert span {
    align-self: center;
}

.alert:last-child {
    justify-self: right;
}

.alert.info {
    color: #033c75;
    background-color: #32abfd;
    border-color: #033c75;
}

.alert.success {
    color: #004218;
    background-color: #169c59;
    border-color: #004218;
}

.alert.warn {
    color: #684309;
    background-color: #f6b000;
    border-color: #684309;
}

.alert.error {
    color: #490507;
    background-color: #f5424d;
    border-color: #490507;
}
</style>
