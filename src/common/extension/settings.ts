export class ExtensionSettings {
  public static readonly enabled = storage.defineItem<boolean>(
    "local:enabled",
    {
      fallback: true,
    }
  );
}
