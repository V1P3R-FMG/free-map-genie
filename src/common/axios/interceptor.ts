import { toUrl } from "../url";
import { InterceptorRouter, type Method } from "./router";

import type { Axios, InternalAxiosRequestConfig } from "axios";

export class AxiosInterceptor extends InterceptorRouter {
  private readonly axios: Axios;
  private readonly interceptorHanlde: number;

  public constructor(axios: Axios) {
    super();

    this.axios = axios;
    this.interceptorHanlde = axios.interceptors.request.use(
      //
      this.createInterceptor()
    );
  }

  public uninstall() {
    this.axios.interceptors.request.eject(this.interceptorHanlde);
  }

  private createInterceptor() {
    return async (config: InternalAxiosRequestConfig) => {
      if (!config.url || !config.method) {
        return config;
      }

      const method = config.method.toUpperCase() as Method;
      const url = toUrl(config.url);
      const data = config.data as any;

      const result = await this.intercept(method, url.pathname, data);

      if (result.block) {
        config.adapter = () => {
          return Promise.resolve({
            data: result.data,
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: null,
          });
        };
      }

      return config;
    };
  }
}
