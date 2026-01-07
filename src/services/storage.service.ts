import { normalizeUrl } from "@/common/url";
import { createService } from "@/common/messaging";

import offscreenService from "./offscreen.service";

import type { ProxiedObject } from "@/common/messaging";

export class StorageService {
  public get(key: string) {
    return localStorage.getItem(key);
  }

  public set(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  public remove(key: string) {
    return localStorage.removeItem(key);
  }

  public has(key: string) {
    return localStorage.getItem(key) !== null;
  }

  public keys() {
    return Object.keys(localStorage);
  }

  public clear() {
    localStorage.clear();
  }
}

const createProxyForDomain = (domain: string) => {
  const url = URL.canParse(domain)
    ? new URL(domain)
    : new URL("https://" + domain);

  const namespace = `StorageService::[${url.host}]`;

  return createService({
    context() {
      return new StorageService();
    },
    namespace,
    heartbeatTimeout: 60000,
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
