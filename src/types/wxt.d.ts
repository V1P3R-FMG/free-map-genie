declare module "wxt/browser" {
  interface WxtRuntime {
    getURL(path: string): string;
  }

  export type PublicPathLike = PublicPath | (string & {});
}

export {};
