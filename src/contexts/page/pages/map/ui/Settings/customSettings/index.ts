import { RememberFoundLocationsShownSetting } from "./settings/rememberFoundLocationsShown";
import { RememberMapTypeSetting } from "./settings/rememberMapLayout";
import { RememberToggleInteriorsOverlaySetting } from "./settings/rememberToggleInteriorsOverlay";

import type { CustomSetting } from "./customSetting";

export * from "./customSetting";

export class CustomSettings {
  public readonly rememberFoundLocationsShown =
    new RememberFoundLocationsShownSetting();
  public readonly rememberMapType = new RememberMapTypeSetting();
  public readonly rememberToggleInteriorsOverlay =
    new RememberToggleInteriorsOverlaySetting();

  public get all(): CustomSetting[] {
    return Object.values(this);
  }
}
