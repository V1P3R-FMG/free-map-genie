import type { Page } from "@playwright/test";

export class LoginPage {
  private loginPage?: Page;

  public constructor(private readonly page: Page) {}

  public async clearCookies() {
    await this.page.context().clearCookies();
  }

  private async gotoLoginPage(url: string) {
    await this.page.goto(url);

    const visible = await this.privacyAcceptButton.isVisible();
    if (visible) {
      await this.privacyAcceptButton.click();
    }

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.loginButton.click(),
    ]);

    this.loginPage = newPage;
  }

  public async gotoMapgenieLoginPage() {
    await this.gotoLoginPage("https://mapgenie.io/tarkov/maps/factory");
  }

  public async gotoRdr2mapLoginPage() {
    await this.gotoLoginPage("https://rdr2map.com/");
  }

  public async waitForMapPage() {
    if (!this.loginPage) {
      throw new Error("Login page is not initialized");
    }
    await this.loginPage.waitForURL("https://mapgenie.io/tarkov/maps/factory");
  }

  public get privacyAcceptButton() {
    return this.page.getByRole("button", { name: "I Accept" });
  }

  public get loginButton() {
    return this.page.getByRole("link", { name: "Login" });
  }

  public get emailInput() {
    if (!this.loginPage) {
      throw new Error("Login page is not initialized");
    }
    return this.loginPage.getByRole("textbox", { name: "E-Mail Address" });
  }

  public get passwordInput() {
    if (!this.loginPage) {
      throw new Error("Login page is not initialized");
    }
    return this.loginPage.getByRole("textbox", { name: "Password" });
  }

  public get submitButton() {
    if (!this.loginPage) {
      throw new Error("Login page is not initialized");
    }
    return this.loginPage.getByRole("button", { name: "Login" });
  }

  public cookies() {
    if (!this.loginPage) {
      throw new Error("Login page is not initialized");
    }

    return this.loginPage
      .context()
      .cookies(["https://mapgenie.io/", "https://rdr2map.com/"]);
  }
}
