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
/* eslint-enable no-var */

declare let logger: InstanceType<typeof import("../logger").Logger>;
