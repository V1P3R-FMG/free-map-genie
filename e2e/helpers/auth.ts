import dotenv from "dotenv";

import { globalCache } from "../globalCache";
import { LoginPage } from "../pages/login";

import type { Browser } from "@playwright/test";

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

export const getCredentials = (): Credentials => {
  const config = dotenv.config();

  if (config.error) {
    throw config.error;
  }

  const email = process.env.MG_EMAIL ?? config.parsed?.MG_EMAIL;
  const password = process.env.MG_PASSWORD ?? config.parsed?.MG_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "MG_EMAIL and MG_PASSWORD environment variables are required"
    );
  }

  return { email, password };
};
