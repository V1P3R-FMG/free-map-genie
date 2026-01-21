import { LazyGetter } from "lazy-get-decorator";

export class ExtensionSettings {
  @LazyGetter()
  public static get enabled() {
    return storage.defineItem<boolean>("local:enabled", {
      fallback: true,
    });
  }
}
