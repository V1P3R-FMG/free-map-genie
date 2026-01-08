import { Page } from "./page";

export class HomePage extends Page {
  public async start() {
    // No-op
  }

  public async canStart() {
    return true;
  }
}
