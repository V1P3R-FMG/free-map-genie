import { Page } from "./page";

export class HomePage extends Page {
  public start() {
    // Currently, nothing to do on the home page
  }

  public canStart() {
    return true;
  }

  public restore() {
    // No-op
  }
}
