import {
  globalCache as genericGlobalCache,
  type GlobalCache,
} from "@global-cache/playwright";

import type { Cookie } from "@playwright/test";

export type GlobalCacheSchema = {
  "auth-cookies": Array<Cookie>;
};

// Re-export typed globalCache
export const globalCache = genericGlobalCache as GlobalCache<GlobalCacheSchema>;
