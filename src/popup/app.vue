<script lang="ts" setup>
import InputTooltip from "@ui/components/input-tooltip.vue";
import InputCheckbox from "@ui/components/input-checkbox.vue";
import OptionContainer from "@ui/components/option-container.vue";
import ThemeProvider from "@ui/components/theme-provider.vue";
</script>

<template>
    <ThemeProvider theme="dark">
        <div class="app-container">
            <span class="title">FMG Popup</span>

            <OptionContainer type="checkbox">
                <InputTooltip tooltip="test">
                    <InputCheckbox label="checkbox-test" name="checkbox-test" />
                </InputTooltip>
            </OptionContainer>
        </div>
    </ThemeProvider>
</template>

<style lang="css">
.app-container {
    background-color: var(--background);
    color: var(--color);
    width: 400px;
    padding: 10px 20px;
}

.title {
    font-size: 1.3rem;
    font-weight: bold;
    text-transform: uppercase;
}
</style>
