import { createService, type ProxiedObject } from "@/common/messaging";

import offscreenService from "./offscreen.service";

export class StorageService {
  public get(key: string) {
    return localStorage.getItem(key);
  }

  public getBulk(keys: string[]) {
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      result[key] = localStorage.getItem(key);
    }
    return result;
  }

  public set(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  public setBulk(map: Record<string, string>) {
    for (const [key, value] of Object.entries(map)) {
      localStorage.setItem(key, value);
    }
  }

  public remove(key: string) {
    return localStorage.removeItem(key);
  }

  public removeBulk(keys: string[]) {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }

  public has(key: string) {
    return localStorage.getItem(key) !== null;
  }

  public hasBulk(keys: string[]) {
    const result: Record<string, boolean> = {};
    for (const key of keys) {
      result[key] = localStorage.getItem(key) !== null;
    }
    return result;
  }

  public hasAny(keys: string[]) {
    for (const key of keys) {
      if (localStorage.getItem(key) !== null) {
        return true;
      }
    }
    return false;
  }

  public keys() {
    return Object.keys(localStorage);
  }

  public clear() {
    localStorage.clear();
  }
}

const getHost = (domain: string): string => {
  try {
    return new URL(domain).host;
  } catch {
    return new URL("https://" + domain).host;
  }
};

const createProxyForDomain = (domain: string) => {
  const host = getHost(domain);

  const namespace = `StorageService::[${host}]`;

  return createService({
    context: StorageService,
    namespace,
    heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
  });
};

const use = async (domain: string) => {
  const offscreen = offscreenService.use();

  await offscreen.addIframe(domain + "/?fmgStorage");

  const { use } = createProxyForDomain(domain);

  return use();
};

const provide = (domain: string) => {
  const { provide } = createProxyForDomain(domain);

  return provide();
};

const storageService = {
  use,
  provide,
};

namespace storageService {
  export type Instance = ProxiedObject<StorageService>;
}

export default storageService;
