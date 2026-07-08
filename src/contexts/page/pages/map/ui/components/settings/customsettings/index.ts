import { RememberFoundLocationsShownSetting } from "./settings/rememberfoundlocationsshown";
import { RememberMapTypeSetting } from "./settings/remembermaplayout";
import { RememberToggleInteriorsOverlaySetting } from "./settings/remembertoggleinteriorsoverlay";
import { RememberTagFiltersSetting } from "./settings/remembertagfilters";

import type { CustomSetting } from "./customsetting";

export * from "./customsetting";

export class CustomSettings {
  public readonly rememberFoundLocationsShown =
    new RememberFoundLocationsShownSetting();
  public readonly rememberMapType = new RememberMapTypeSetting();
  public readonly rememberToggleInteriorsOverlay =
    new RememberToggleInteriorsOverlaySetting();
  public readonly rememberTagFilters = new RememberTagFiltersSetting();

  public get all(): CustomSetting[] {
    return Object.values(this);
  }
}
