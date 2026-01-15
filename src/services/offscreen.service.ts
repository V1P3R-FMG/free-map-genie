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

  public async addIframe(url: string) {
    const normalizedUrl = URL.canParse(url)
      ? new URL(url)
      : new URL(`https://${url}`);
    const normalizedUrlStr = normalizedUrl.toString();

    if (this._iframes.has(normalizedUrlStr)) return;

    const iframe = await this.createIframe(normalizedUrlStr);
    this._iframes.set(normalizedUrlStr, iframe);
  }

  public removeIframe(url: string) {
    const normalizedUrl = URL.canParse(url)
      ? new URL(url)
      : new URL(`https://${url}`);
    const normalizedUrlStr = normalizedUrl.toString();

    const iframe = this._iframes.get(normalizedUrlStr);

    if (!iframe) return;

    iframe.remove();
    this._iframes.delete(normalizedUrlStr);
  }
}

const offscreenService = createService({
  context: OffscreenService,
  heartbeatTimeout: 60000,
  namespace: "OffscreenService",
});

namespace offscreenService {
  export type Instance = ProxiedObject<OffscreenService>;
}

export default offscreenService;
