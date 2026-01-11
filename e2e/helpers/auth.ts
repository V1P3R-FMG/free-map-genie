import { globalCache } from "../globalCache";
import { LoginPage } from "../pages/login";

import type { Browser, BrowserContext } from "@playwright/test";

export interface Credentials {
  email: string;
  password: string;
}

export const login = async (
  browser: Browser,
  { email, password }: Credentials
) => {
  return globalCache.get("auth-cookies", { ttl: "1 hour" }, async () => {
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.clearCookies();
    await loginPage.gotoLoginPage();

    await loginPage.emailInput.fill(email);
    await loginPage.passwordInput.fill(password);
    await loginPage.submitButton.click();

    await loginPage.waitForMapPage();

    return loginPage.cookies();
  });
};

export const loadCookies = async (context: BrowserContext) => {
  const cookies = await login(context.browser(), {
    email: process.env.MG_EMAIL!,
    password: process.env.MG_PASSWORD!,
  });

  if (!cookies) return;

  console.log("Loading auth cookies into browser context...");

  await context.addCookies(cookies);
};
