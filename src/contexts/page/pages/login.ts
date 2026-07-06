import { Page } from "./page";

export class LoginPage extends Page {
  public async start() {
    // Auto-fill login form in development mode
    if (import.meta.env.DEV) {
      const email = import.meta.env.MG_EMAIL;
      const password = import.meta.env.MG_PASSWORD;

      if (email && password) {
        const emailInput = document.querySelector<HTMLInputElement>(
          'input[name="email"]'
        );
        const passwordInput = document.querySelector<HTMLInputElement>(
          'input[name="password"]'
        );
        const loginButton = document.querySelector<HTMLButtonElement>(
          'button[type="submit"]'
        );

        if (emailInput && passwordInput && loginButton) {
          emailInput.value = email;
          passwordInput.value = password;
          loginButton.click();
        } else {
          logger.warn("Login form elements not found.");
        }
      }
    }
  }

  public info(): Record<string, any> {
    return {};
  }
}
