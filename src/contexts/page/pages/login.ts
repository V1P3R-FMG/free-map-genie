import { Page } from "./page";

import async from "@/common/async";

import backgroundService from "@/services/background.service";

export class LoginPage extends Page {
  private readonly background = backgroundService.use();

  public async start() {
    const form = await async.waitUntil(() => document.querySelector("form")!);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
      });

      await this.background.reloadBackend();

      window.location.href = res.url;
    });
  }

  public info(): Record<string, any> {
    return {};
  }
}
