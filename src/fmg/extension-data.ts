export class FMG_ExtensionData {
    private static instance: FMG_ExtensionData;

    private data: FMG.Extension.Data;

    private constructor() {
        if (sessionStorage.getItem("fmg:extension:data")) {
            this.data = {} as any;
            this.load();
            return;
        }
        throw new Error("`fmg:extension:data` not found in session storage!");
    }

    /**
     * Extension script will set `fmg:extension:data` in session storage,
     * so that the content script can access it.
     */
    public load(): void {
        const data = JSON.parse(
            sessionStorage.getItem("fmg:extension:data") || "{}"
        );
        if (data) {
            this.data.settings = data.settings ?? {};
            this.data.bookmarks = data.bookmarks ?? {};
        }
        sessionStorage.removeItem("fmg:extension:data");
    }

    /**
     * Reloads the data from session storage.
     */
    public static reload(): void {
        if (!FMG_ExtensionData.instance) {
            FMG_ExtensionData.instance = new FMG_ExtensionData();
            return;
        }
        FMG_ExtensionData.instance.load();
    }

    /**
     * Get the settings from the data.
     */
    public static get settings(): FMG.Extension.Data["settings"] {
        if (!FMG_ExtensionData.instance) {
            FMG_ExtensionData.instance = new FMG_ExtensionData();
        }
        return FMG_ExtensionData.instance.data.settings;
    }

    /**
     * Get the bookmarks from the data.
     */
    public static get bookmarks(): FMG.Extension.Data["bookmarks"] {
        if (!FMG_ExtensionData.instance) {
            FMG_ExtensionData.instance = new FMG_ExtensionData();
        }
        return FMG_ExtensionData.instance.data.bookmarks;
    }
}
