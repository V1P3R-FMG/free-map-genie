declare type BrowserName = "chrome" | "firefox";

declare let __BROWSER__: BrowserName;
declare let __VERSION__: string;
declare let __HOMEPAGE__: string;
declare let __AUTHOR__: string;
declare let __DEBUG__: boolean;
declare let __WATCH__: boolean;

declare let logger: InstanceType<typeof import("../logger").Logger>;
