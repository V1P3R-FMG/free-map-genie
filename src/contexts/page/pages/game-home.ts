import { Page } from "./page";

export class GameHomePage extends Page {
  public async start() {
    // No-op
  }

  public async canStart() {
    return true;
  }
}
