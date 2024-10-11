declare type BrowserName = "chrome" | "firefox";

/* eslint-disable no-var */
declare var __BROWSER__: BrowserName;
declare var __VERSION__: string;
declare var __HOMEPAGE__: string;
declare var __AUTHOR__: string;
declare var __DEBUG__: boolean;
declare var __WATCH__: boolean;
declare var __PORT__: number;
declare var __CACHE_MAX_AGE__: number;
declare var __MAX_BACKUPS_COUNT__: number;

declare var __GLOBAL__API__: string;

declare var getConnections: () =>
    | Map<
          string,
          {
              context: string;
              port: chrome.runtime.Port;
              fingerprint: string;
          }
      >
    | undefined;
/* eslint-enable no-var */

declare let logging: InstanceType<typeof import("../logging").Logger>;
