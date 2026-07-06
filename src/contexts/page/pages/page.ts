export abstract class Page {
  // Start the page script
  public abstract start(): void | Promise<void>;

  // Get info about the page
  public abstract info(): Record<string, any> | Promise<Record<string, any>>;
}
