export abstract class Page {
  public abstract start(): void | Promise<void>;
  public abstract canStart(): boolean | Promise<boolean>;
}
