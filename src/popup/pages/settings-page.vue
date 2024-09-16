<script lang="ts" setup>
import PageView from "@ui/components/page-view.vue";
import InputTooltip from "@ui/components/input-tooltip.vue";
import InputCheckbox from "@ui/components/input-checkbox.vue";
import OptionContainer from "@ui/components/option-container.vue";
</script>

<template>
    <PageView name="settings" icon="gear">
        <OptionContainer type="checkbox">
            <InputTooltip tooltip="test" :top="true">
                <InputCheckbox label="checkbox-test" name="checkbox-test" />
            </InputTooltip>
        </OptionContainer>
    </PageView>
</template>
