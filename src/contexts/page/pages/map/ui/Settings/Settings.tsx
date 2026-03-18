import { IntegratedComponent } from "@/common/ui";
import { Setting } from "./Setting";
import { MapgenieSettings } from "./mapgenieSettings";

export type SettingData = {
  label: string;
  enabled: boolean;
  onChange?: (value: boolean) => void;
};

export type SettingDataFactory = (settings: MapgenieSettings) => SettingData;

export class Settings extends IntegratedComponent<Setting.Props> {
  private readonly mapgenieSettings = new MapgenieSettings();

  constructor(props: Setting.Props) {
    super(props);
  }

  public render() {
    return (
      <>
        {this.props.settings.map((setting) => {
          const settingData =
            typeof setting === "function"
              ? setting(this.mapgenieSettings)
              : setting;
          return (
            <Setting
              key={settingData.label}
              label={settingData.label}
              enabled={settingData.enabled}
              onChange={settingData.onChange}
            />
          );
        })}
      </>
    );
  }

  public async mount() {
    await super.mount("#settings-section", "append");
  }
}

namespace Setting {
  export interface Props {
    settings: SettingData[] | SettingDataFactory[];
  }
}
