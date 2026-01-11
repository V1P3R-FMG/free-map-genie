import "dotenv/config";

import { test as setup } from "./fixtures";
import { login } from "./helpers/auth";

setup("user authentication", { tag: "@no-auth" }, async ({ browser }) => {
  const email = process.env.MG_EMAIL;
  const password = process.env.MG_PASSWORD;

  if (!email || !password) {
    throw new Error("MG_EMAIL and MG_PASSWORD must be set in environment");
  }

  await login(browser, { email, password });
});
