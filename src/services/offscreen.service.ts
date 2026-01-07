import { createService } from "@/common/messaging";
import { normalizeUrl } from "@/common/url";
import { waitForBody } from "@/common/dom";

import type { ProxiedObject } from "@/common/messaging";

export class OffscreenService {
  private readonly _iframes = new Map<string, JQuery<HTMLIFrameElement>>();

  private async createIframe(url: string) {
    const body = await waitForBody();

    return $<HTMLIFrameElement>("<iframe/>")
      .attr({
        src: url,
        sandbox: "allow-same-origin",
      })
      .css({
        display: "none",
      })
      .appendTo(body);
  }

  public getIframes() {
    return [...this._iframes.keys()];
  }

  public async addIframe(url: string) {
    const normalizedUrl = normalizeUrl(url);

    if (this._iframes.has(normalizedUrl)) return;

    const iframe = await this.createIframe(normalizedUrl);
    this._iframes.set(normalizedUrl, iframe);
  }

  public removeIframe(url: string) {
    const normalizedUrl = normalizeUrl(url);
    const iframe = this._iframes.get(normalizedUrl);

    if (!iframe) return;

    iframe.remove();
    this._iframes.delete(normalizedUrl);
  }
}

const offscreenService = createService({
  context() {
    return new OffscreenService();
  },
  heartbeatTimeout: 10_000,
  namespace: "OffscreenService",
});

namespace offscreenService {
  export type Instance = ProxiedObject<OffscreenService>;
}

export default offscreenService;
