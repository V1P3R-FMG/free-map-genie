import { Page } from "./page";

export class HomePage extends Page {
  public async start() {
    // Currently, nothing to do on the home page
  }

  public async canStart() {
    return true;
  }
}
