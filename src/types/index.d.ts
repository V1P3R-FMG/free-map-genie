declare type BrowserName = "chrome" | "firefox";

/* eslint-disable no-var */
declare var __BROWSER__: BrowserName;
declare var __VERSION__: string;
declare var __HOMEPAGE__: string;
declare var __AUTHOR__: string;
declare var __IS_MOBILE__: boolean;
declare var __DEBUG__: boolean;
declare var __WATCH__: boolean;
declare var __PORT__: number;
declare var __HOSTNAME__: string;
declare var __CACHE_MAX_AGE__: number;
declare var __MAX_BACKUPS_COUNT__: number;
declare var __OVERRIDE_SERVER_URL__: string | undefined;

declare var __GLOBAL__API__: string;

// Background debug functions
declare var getConnections: (() => Map<string, import("@shared/channel/background").CachedPortInfo>) | undefined;
declare var getActiveTab: (() => import("@shared/channel/background").ActiveTab | undefined) | undefined;
/* eslint-enable no-var */

declare let logging: InstanceType<typeof import("../logging").Logger>;
