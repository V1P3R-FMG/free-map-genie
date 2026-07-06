import { match, type MatchFunction } from "path-to-regexp";

const METHODS = ["GET", "POST", "PUT", "DELETE", "HEAD"] as const;

export type Method = (typeof METHODS)[number];

export type MethodWithAny = Method | "ANY";

export type ParamsData = Record<string, any>;

export type RouteRule<P extends ParamsData, T> = {
  path: string;
  matcher: MatchFunction<P>;
  handler: Handler<P, T>;
};

export type Routes = Partial<Record<MethodWithAny, RouteRule<any, any>[]>>;

type BlockCallback = (data?: any) => void;

export interface InterceptResult {
  block: boolean;
  data?: any;
}

interface InterceptState {
  result: InterceptResult;
  block: BlockCallback;
}

export interface InterceptorContext<P extends Record<string, any>, T> {
  params: P;
  postData: T;
  block: BlockCallback;
}

export type Handler<P extends ParamsData, T> = (
  context: InterceptorContext<P, T>
) => any;

type MethodRegistrar = <P extends ParamsData, T = void>(
  path: string,
  handler: Handler<P, T>
) => void;

type MethodRegistrars = {
  [K in MethodWithAny as Lowercase<K>]: MethodRegistrar;
};

export class InterceptorRouter implements MethodRegistrars {
  private readonly routes: Routes = {};

  private register(
    method: MethodWithAny,
    path: string,
    handler: Handler<any, any>
  ) {
    method = method.toUpperCase() as Method;

    const methodRoutes = (this.routes[method] ??= []);
    const matcher = match(path);

    methodRoutes.push({ path, matcher, handler });
  }

  private createInteceptorState() {
    const result: InterceptResult = {
      block: false,
    };

    const block = (data: any) => {
      result.block = true;
      result.data = data;
    };

    return {
      result,
      block,
    };
  }

  private async handleRoute(
    route: RouteRule<any, any>,
    url: string,
    postData: any,
    { result, block }: InterceptState
  ) {
    const { params } = route.matcher(url) || { params: undefined };

    if (params) {
      await route.handler({
        params,
        postData,
        block,
      });
    }

    return result.block;
  }

  protected async intercept(
    method: Method,
    url: string,
    postData: any
  ): Promise<InterceptResult> {
    const routes = [this.routes[method], this.routes["ANY"]];

    const state = this.createInteceptorState();

    for (const methodRoutes of routes) {
      for (const route of methodRoutes || []) {
        if (await this.handleRoute(route, url, postData, state)) {
          break;
        }
      }
    }

    return state.result;
  }

  public get<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("GET", path, handler);
  }

  public put<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("PUT", path, handler);
  }

  public post<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("POST", path, handler);
  }

  public delete<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("DELETE", path, handler);
  }

  public head<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("HEAD", path, handler);
  }

  public any<P extends ParamsData, T = void>(
    path: string,
    handler: Handler<P, T>
  ) {
    this.register("ANY", path, handler);
  }
}
