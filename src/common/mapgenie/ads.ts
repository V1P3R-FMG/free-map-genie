import waitUntil from "async-wait-until";

type AdBlockerElement = JQuery | HTMLElement | string | null;

export default class MapgenieAdBlocker {
  private static readonly REMOVE_CHECK_INTERVAL = 500;
  private static readonly TIMEOUT: number = 10000;

  public static lastAdRemovedAt: number = Date.now();
  public static handle: number | null = null;
  public static autoStop: boolean = true;

  private static removeElement(element: AdBlockerElement): boolean {
    if (!element) return false;

    if (element instanceof HTMLElement) {
      element.remove();
      return true;
    }

    if (typeof element === "string") {
      return $(element).remove().length > 0;
    }

    return element.remove().length > 0;
  }

  private static removeElements(elements: AdBlockerElement[]): boolean;
  private static removeElements(...elements: AdBlockerElement[]): boolean;
  private static removeElements(
    ...elements: AdBlockerElement[] | AdBlockerElement[][]
  ): boolean {
    return elements.reduce((acc, el) => {
      if (Array.isArray(el)) {
        return acc || this.removeElements.apply(this, el);
      }
      return acc || this.removeElement(el);
    }, false);
  }

  private static removeIframeAds() {
    return this.removeElements('iframe[name^="ifrm_"]');
  }

  private static removeGoogleAds() {
    return this.removeElements(
      'iframe[name*="goog"]',
      'div[class^="adsbygoogle"]',
      'div[id^="google_ads_iframe_"]',
      'iframe[src*="safeframe.googlesyndication"]'
    );
  }

  private static removeNitroAds() {
    return this.removeElements("#nitro-floating-wrapper");
  }

  private static removeBodyAds() {
    return this.removeElements(
      'html > iframe[sandbox="allow-scripts allow-same-origin"]'
    );
  }

  private static removeUpgradeProAd() {
    return this.removeElements("#blobby-left");
  }

  private static removeUpgradeProButton() {
    return this.removeElements("#button-upgrade");
  }

  private static removeBlueKai() {
    return this.removeElements('iframe[name="__bkframe"]');
  }

  private static removePrivacyPopupElement() {
    return this.removeElements("#onetrust-consent-sdk");
  }

  private static removeAds() {
    return [
      this.removeUpgradeProAd(),
      this.removeUpgradeProButton(),
      this.removeIframeAds(),
      this.removeGoogleAds(),
      this.removeNitroAds(),
      this.removeBodyAds(),
      this.removeBlueKai(),
    ].some((x) => x);
  }

  private static tick() {
    const adsRemoved = this.removeAds();

    if (adsRemoved) {
      this.lastAdRemovedAt = Date.now();
    }

    const now = Date.now();
    const elapsed = now - this.lastAdRemovedAt;

    if (elapsed > this.TIMEOUT) {
      logger.debug(
        `AdBlocker stopped after ${this.TIMEOUT}ms of no ads being removed.`
      );
      this.stop();
      return;
    }
  }

  private static stop() {
    if (!this.handle) return;
    window.clearInterval(this.handle);
    this.handle = null;
  }

  public static remove() {
    if (this.handle != null) return;
    this.handle = window.setInterval(
      () => this.tick(),
      this.REMOVE_CHECK_INTERVAL
    );
  }

  public static cancel() {
    this.stop();
  }

  /**
   * Removes the privacy popup element in development mode.
   */
  public static async removePrivacyPopup() {
    if (!import.meta.env.DEV) return;

    try {
      await waitUntil(() => !!this.removePrivacyPopupElement());
    } catch {
      // Ignore timeout
    }
  }
}
