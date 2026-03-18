import { SettingDataFactory } from "../Settings";

export const rememberFoundLocationsShownSettingDataFactory: SettingDataFactory =
  (settings) => {
    logger.debug("Initializing Remember Found Locations Shown setting");

    const setting = settings.get<boolean>("remember_found_locations_shown");
    let remembering = setting.value !== null;

    // Load initial value and apply it
    const load = () => {
      const storedValue = setting.value;
      if (storedValue !== null) {
        window.mapManager?.setFoundLocationsShown(storedValue);
        $("#toggle-found").toggleClass("disabled", !storedValue);
      }
    };

    // Wait for the map to load before applying the setting
    if (!window.map) {
      throw new Error("window.map is not available");
    }

    if (!window.map?.loaded()) {
      window.map.on("load", load);
    } else {
      load();
    }

    // Listen for found location shown state changes and store them
    if (!window.mapManager?.setFoundLocationsShown) {
      throw new Error("mapManager.setFoundLocationsShown is not available");
    }

    const _setFoundLocationsShown = window.mapManager.setFoundLocationsShown;
    window.mapManager.setFoundLocationsShown = (shown: boolean) => {
      _setFoundLocationsShown.call(window.mapManager, shown);

      if (remembering) {
        setting.value = shown;
      }
    };

    return {
      label: "Remember Found Locations Shown",
      enabled: remembering,
      onChange: (enabled) => {
        remembering = enabled;
        if (enabled) {
          setting.value = window.mapManager?.showFoundLocations ?? false;
        } else {
          setting.value = null;
        }
      },
    };
  };
