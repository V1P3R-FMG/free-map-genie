<script lang="ts" setup>
import Icon from "@components/icon.vue";
import type { State } from "@/content";

export interface Props {
    state: State;
}

defineProps<Props>();
</script>

<template>
    <div class="info">
        <div class="info-item">
            <h4>PageType</h4>
            <span>{{ state.type }}</span>
        </div>
        <div class="info-item">
            <h4>User</h4>
            <span>{{ state.user }}</span>
        </div>
        <div class="info-item">
            <h4>Attached</h4>
            <Icon
                icon="cd"
                size="14px"
                :class="state.attached ? 'active' : 'inactive'"
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
