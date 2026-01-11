import { BasePage } from "./base";

import type { Page } from "@playwright/test";
import type { AxiosResponse } from "axios";
import type { UserData } from "@src/common/storage";

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
      { url, data }
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
    return this.page.waitForFunction("!!window.axios", undefined, {
      timeout: 5000,
    });
  }

  public async waitForAxiosInterceptor() {
    return this.page.waitForFunction(
      "!!window.axios?.interceptors.request.handlers.length",
      undefined,
      { timeout: 5000 }
    );
  }

  public async getUserData(): Promise<Partial<UserData>> {
    return this.page.evaluate(() => {
      const { locations, trackedCategoryIds } = window.user ?? {};
      const { notes, presets } = window.mapData ?? {};

      const presetOrdering = presets?.map((preset) => preset.id);

      return { locations, trackedCategoryIds, notes, presets, presetOrdering };
    });
  }
}
