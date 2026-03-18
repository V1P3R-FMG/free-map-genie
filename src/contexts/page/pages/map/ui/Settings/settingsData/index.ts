import { RememberFoundLocationsShownSettingData } from "./rememberFoundLocationsShown";
import { RememberMapTypeSettingData } from "./rememberMapLayout";

export * from "./settingData";

export const settingsData = {
  RememberFoundLocationsShownSettingData,
  RememberMapTypeSettingData,
};

export const allSettingsData = Object.values(settingsData);
