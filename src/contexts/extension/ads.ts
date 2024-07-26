export interface AdBlockerStats {
    totalAdsRemovedThisTick: number;
    totalAdsRemoveLastCoupleTicks: number;
}

export interface OnTickCallback {
    (this: AdBlocker, stats: AdBlockerStats): any;
}

export default class AdBlocker {
    public static REMOVE_CHECK_INTERVAL = 2000;

    public static totalAdsRemoveLastCoupleTicks: (number | undefined)[] = Array.withLength(10, undefined);

    public static handle: number | null = null;
    public static autoStop: boolean = true;

    private static readonly onTickCallbacks: OnTickCallback[] = [];

    private static async removeIframeAds(): Promise<number> {
        return $('iframe[name^="ifrm_"]').remove().length;
    }

    private static async removeGoogleAds(): Promise<number> {
        return [
            $('iframe[name*="goog"]').remove().length,
            $('div[id^="google_ads_iframe_"]').remove().length,
            $('iframe[src*="safeframe.googlesyndication"]').remove().length,
        ].sum();
    }

    private static async removeNitroAds(): Promise<number> {
        return $("#nitro-floating-wrapper").remove().length;
    }

    private static async removeBodyAds(): Promise<number> {
        return $('html > iframe[sandbox="allow-scripts allow-same-origin"]').remove().length;
    }

    private static async removeUpgradeProAd(): Promise<number> {
        return $("#blobby-left").remove().length;
    }

    private static async removeBlueKai(): Promise<number> {
        return $('iframe[name="__bkframe"]').remove().length;
    }

    private static removePrivacyPopupElement(): number {
        return $("#onetrust-consent-sdk").remove().length;
    }

    private static async removeAds(): Promise<number> {
        return (
            await Promise.all([
                this.removeIframeAds(),
                this.removeGoogleAds(),
                this.removeNitroAds(),
                this.removeBodyAds(),
                this.removeUpgradeProAd(),
                this.removeBlueKai(),
            ])
        ).sum();
    }

    public static stats(): AdBlockerStats {
        return Object.seal({
            totalAdsRemovedThisTick: this.totalAdsRemoveLastCoupleTicks[0] ?? 0,
            totalAdsRemoveLastCoupleTicks: this.totalAdsRemoveLastCoupleTicks.map((x) => x ?? 0).sum(),
        });
    }

    private static async tick() {
        this.totalAdsRemoveLastCoupleTicks.shift();
        this.totalAdsRemoveLastCoupleTicks.push(await this.removeAds());

        const stats = this.stats();
        this.onTickCallbacks.forEach((cb) => cb.call(this, stats));

        if (this.autoStop && this.totalAdsRemoveLastCoupleTicks.every((x) => x !== undefined)) {
            const ms = this.REMOVE_CHECK_INTERVAL * this.totalAdsRemoveLastCoupleTicks.length;
            const seconds = ms / 1000;
            logger.debug(`AdBlocker stopped no more ads removed in the last ${seconds} seconds.`);
            this.stop();
        }
    }

    public static start() {
        if (this.handle != null) return;
        this.handle = window.setInterval(() => this.tick(), this.REMOVE_CHECK_INTERVAL);
    }

    public static stop() {
        if (!this.handle) return;
        window.clearInterval(this.handle);
        this.handle = null;
    }

    public static onTick(callback: OnTickCallback) {
        this.onTickCallbacks.push(callback);
    }

    public static offTick(callback: OnTickCallback) {
        const i = this.onTickCallbacks.findIndex((cb) => cb === callback);
        if (i > 0) this.onTickCallbacks.splice(i, 1);
    }

    public static async removePrivacyPopup() {
        if (!__DEBUG__) throw "This should be removed for release builds.";

        await Promise.waitForCondition(() => !!this.removePrivacyPopupElement()).catch((_) =>
            logger.warn("Privacy popup not visible.")
        );
    }
}
