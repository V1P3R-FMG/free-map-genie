import waitUntil from "async-wait-until";

export default class MapgenieAdBlocker {
  public static readonly REMOVE_CHECK_INTERVAL = 500;
  public static readonly TIMEOUT: number = 10000;

  public static lastAdRemovedAt: number = Date.now();
  public static handle: number | null = null;
  public static autoStop: boolean = true;

  private static removeElements(elements: JQuery | JQuery[]): boolean {
    elements = Array.isArray(elements) ? elements : [elements];
    return elements.reduce((acc, el) => acc + el.remove().length, 0) > 0;
  }

  private static removeIframeAds() {
    return this.removeElements($('iframe[name^="ifrm_"]'));
  }

  private static removeGoogleAds() {
    return this.removeElements([
      $('iframe[name*="goog"]'),
      $('div[id^="google_ads_iframe_"]'),
      $('iframe[src*="safeframe.googlesyndication"]'),
    ]);
  }

  private static removeNitroAds() {
    return this.removeElements($("#nitro-floating-wrapper"));
  }

  private static removeBodyAds() {
    return this.removeElements(
      $('html > iframe[sandbox="allow-scripts allow-same-origin"]')
    );
  }

  private static removeUpgradeProAd() {
    return this.removeElements($("#blobby-left"));
  }

  private static removeBlueKai() {
    return this.removeElements($('iframe[name="__bkframe"]'));
  }

  private static removePrivacyPopupElement() {
    return this.removeElements($("#onetrust-consent-sdk"));
  }

  private static removeAds() {
    return [
      this.removeUpgradeProAd(),
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

  public static start() {
    if (this.handle != null) return;
    this.handle = window.setInterval(
      () => this.tick(),
      this.REMOVE_CHECK_INTERVAL
    );
  }

  public static stop() {
    if (!this.handle) return;
    window.clearInterval(this.handle);
    this.handle = null;
  }

  public static async removePrivacyPopup() {
    if (!import.meta.env.DEV)
      throw "This should be removed for release builds.";

    await waitUntil(() => !!this.removePrivacyPopupElement());
  }
}
