import { IntegratedComponent } from "@/common/ui";
import { Setting } from "./Setting";
import { SettingsManager } from "./settingsManager";

export class Settings extends IntegratedComponent<Setting.Props> {
  constructor(props: Setting.Props) {
    super(props);
  }

  public render() {
    return (
      <>
        {this.props.settingsManager.settings.map((setting) => {
          return (
            <Setting
              key={setting.label}
              label={setting.label}
              enabled={setting.enabled}
              onChange={setting.onChange}
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
    settingsManager: SettingsManager;
  }
}
