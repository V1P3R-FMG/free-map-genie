import { InterceptorRouter, type Method } from "./router";

import type { Axios, InternalAxiosRequestConfig } from "axios";

export class AxiosInterceptor extends InterceptorRouter {
  private readonly axios: Axios;
  private readonly interceptorHandle: number;

  public constructor(axios: Axios) {
    super();

    this.axios = axios;

    this.interceptorHandle = axios.interceptors.request.use(
      //
      this.createInterceptor()
    );
  }

  public uninstall() {
    this.axios.interceptors.request.eject(this.interceptorHandle);
  }

  private createInterceptor() {
    return async (config: InternalAxiosRequestConfig) => {
      if (!config.url || !config.method) {
        return config;
      }

      const method = config.method.toUpperCase() as Method;
      const url = new URL(config.url, window.location.origin);
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
