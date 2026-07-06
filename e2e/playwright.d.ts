import { BrowserContextOptions } from "@playwright/test";

declare module "@playwright/test" {
  export type StorageState = BrowserContextOptions["storageState"];
}
