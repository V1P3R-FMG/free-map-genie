export abstract class Page {
  // Start the page script
  public abstract start(): void | Promise<void>;

  // Return true if the page can start, false otherwise
  public abstract canStart(): boolean | Promise<boolean>;

  // Used when page has to restore when its not able to start
  public abstract restore(): void | Promise<void>;
}
