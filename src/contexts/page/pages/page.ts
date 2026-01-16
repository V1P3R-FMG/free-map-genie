export abstract class Page {
  // Start the page script
  public abstract start(): void | Promise<void>;
}
