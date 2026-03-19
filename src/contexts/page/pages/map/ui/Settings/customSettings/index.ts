import { RememberFoundLocationsShownSettingData } from "./settings/rememberFoundLocationsShown";
import { RememberMapTypeSettingData } from "./settings/rememberMapLayout";

import type { CustomSetting } from "./customSetting";

export * from "./customSetting";

export class CustomSettings {
  public readonly rememberFoundLocationsShown =
    new RememberFoundLocationsShownSettingData();

  public readonly rememberMapType = new RememberMapTypeSettingData();

  public get all(): CustomSetting[] {
    return Object.values(this);
  }
}
