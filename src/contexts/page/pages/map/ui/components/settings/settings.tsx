import { IntegratedComponent } from "@/common/ui";
import { Setting } from "./setting";
import { CustomSettings } from "./customsettings";

export class Settings extends IntegratedComponent<Setting.Props> {
  public readonly settings = new CustomSettings();

  public async css() {
    return {
      url: await BrowserUtils.getCssUrl(),
    };
  }

  public render() {
    return (
      <>
        {this.settings.all.map((setting) => {
          return <Setting key={setting.label} setting={setting} />;
        })}
      </>
    );
  }

  public async mount() {
    await super.mount("#settings-section", "append");
  }
}

namespace Setting {
  export interface Props {}
}
