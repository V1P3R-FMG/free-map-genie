import { createService } from "@/common/messaging";
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

  private normalizeUrl(url: string): string {
    try {
      return new URL(url).toString();
    } catch {
      return new URL(`https://${url}`).toString();
    }
  }

  public async addIframe(url: string) {
    const normalizedUrl = this.normalizeUrl(url);

    if (this._iframes.has(normalizedUrl)) return;

    const iframe = await this.createIframe(normalizedUrl);
    this._iframes.set(normalizedUrl, iframe);
  }

  public removeIframe(url: string) {
    const normalizedUrl = this.normalizeUrl(url);

    const iframe = this._iframes.get(normalizedUrl);

    if (!iframe) return;

    iframe.remove();
    this._iframes.delete(normalizedUrl);
  }
}

const offscreenService = createService({
  context: OffscreenService,
  namespace: "OffscreenService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace offscreenService {
  export type Instance = ProxiedObject<OffscreenService>;
}

export default offscreenService;
