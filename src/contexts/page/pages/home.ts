import { Page } from "./page";

export class HomePage extends Page {
  public start() {
    // Currently, nothing to do on the home page
  }

  public info(): Record<string, any> {
    return {};
  }
}
