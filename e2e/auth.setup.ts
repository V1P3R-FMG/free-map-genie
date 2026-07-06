import { test as setup } from "./helpers/fixtures";
import { getCredentials, login } from "./helpers/auth";

setup("user authentication", { tag: "@no-auth" }, async ({ browser }) => {
  const credentials = getCredentials();

  await login(browser, credentials);
});
