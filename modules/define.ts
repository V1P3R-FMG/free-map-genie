import { addViteConfig, defineWxtModule } from "wxt/modules";

declare module "wxt" {
  interface InlineConfig {
    define?: Record<string, string>;
  }
}

export default defineWxtModule({
  configKey: "define",
  setup(wxt, define?: Record<string, string>) {
    if (!define) return;

    addViteConfig(wxt, () => ({ define }));
  },
});
