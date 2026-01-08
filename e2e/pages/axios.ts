import { BasePage } from "./base";

import type { Page } from "@playwright/test";
import type { AxiosResponse } from "axios";

export class AxiosClient {
  constructor(private readonly page: Page) {}

  public async get<T>(url: string): Promise<AxiosResponse<T>> {
    return this.page.evaluate((url) => window.axios!.get(url), url);
  }

  public async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.page.evaluate(({ url, data }) => window.axios!.put(url, data), {
      url,
      data,
    });
  }

  public async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.page.evaluate(
      ({ url, data }) => window.axios!.post(url, data),
      {
        url,
        data,
      }
    );
  }

  public async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.page.evaluate((url) => window.axios!.delete(url), url);
  }
}

export class AxiosPage extends BasePage {
  public readonly axios: AxiosClient;

  constructor(page: Page) {
    super(page);
    this.axios = new AxiosClient(page);
  }

  public async waitForAxios() {
    return this.page.waitForFunction("!!window.axios");
  }

  public async waitForAxiosInterceptor() {
    return this.page.waitForFunction(
      "!!window.axios.interceptors.request.handlers.length"
    );
  }
}
