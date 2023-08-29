<script lang="ts" setup>
import Icon from "@components/icon.vue";

export interface Props {
    info: {
        pageType: "map" | "guide" | "home" | "unknown";
        attached: boolean;
    };
}

defineProps<Props>();
</script>

<template>
    <div class="info">
        <div class="info-item">
            <h4>PageType</h4>
            <span>{{ info.pageType || "unknown" }}</span>
        </div>
        <div class="info-item">
            <h4>Attached</h4>
            <Icon
                icon="cd"
                size="0.75em"
                :class="info.attached ? 'active' : 'inactive'"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item > * {
    background-color: var(--item);
    padding: 5px;
    border-radius: 5px;
}

.info-item > h4 {
    margin: 0;
    font-weight: 400;
    text-align: center;
}

.info-item {
    display: grid;
    grid-template-columns: 1fr 2fr;
    justify-content: center;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-weight: 400;
}

.inactive {
    color: var(--red);
    text-shadow: 0 0 5px var(--red);
}

.active {
    color: var(--green);
    text-shadow: 0 0 5px var(--green);
}
</style>
