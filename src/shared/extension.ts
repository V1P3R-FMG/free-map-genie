import Options from "@/options.json";

interface Data {
    [key: string]: any;
}

export async function save<T extends Data>(data: T) {
    if (!chrome.storage) {
        throw new Error("chrome.storage is not available");
    }
    return chrome.storage.sync.set(data);
}

export async function load<T extends Data>(
    keys: string | string[]
): Promise<T> {
    if (!chrome.storage) {
        throw new Error("chrome.storage is not available");
    }
    return chrome.storage.sync.get(keys) as Promise<T>;
}

export async function remove(keys: string | string[]) {
    if (!chrome.storage) {
        throw new Error("chrome.storage is not available");
    }
    return chrome.storage.sync.remove(keys);
}

export async function clear() {
    if (!chrome.storage) {
        throw new Error("chrome.storage is not available");
    }
    return chrome.storage.sync.clear();
}

/**
 * Migration from v1.2.0 or lower to v2.0.0 or higher
 */
async function migrateData() {
    const { config } = await load<{ config: FMG.Extension.Settings }>("config");
    if (config) {
        await save({ settings: config });
        await remove("config");
    }
}

/**
 * Cleanup settings data.
 * Removes entries that are not in the options.
 * This is useful for removing old settings.
 * @param settings the settings to cleanup
 * @returns the cleaned settings
 */
export function cleanupSettings(
    settings: Record<string, any>
): FMG.Extension.Settings {
    for (const [key, value] of Object.entries(settings)) {
        if (Options.find((option) => option.name === key) === undefined) {
            delete settings[key];
        }
    }
    return settings as FMG.Extension.Settings;
}

/**
 * Fetches the data from the storage
 * @returns the data
 */
export async function getData(): Promise<FMG.Extension.Data> {
    await migrateData();
    const { settings, bookmarks } = await load<FMG.Extension.Data>([
        "settings",
        "bookmarks"
    ]);
    return {
        settings: fillSettings(cleanupSettings(settings || {})),
        bookmarks: bookmarks || []
    };
}

/**
 * Sets the data in the storage
 * @param data the data to set
 */
export async function setData(data: FMG.Extension.Data) {
    await save(data);
}

/**
 * Fills in the missing settings with the default values
 * @param settings the settings to fill
 * @returns the filled settings
 */
export function fillSettings(
    settings: Partial<FMG.Extension.Settings>
): FMG.Extension.Settings {
    return Object.fromEntries(
        Options.map((option) => [
            option.name,
            settings[option.name as keyof FMG.Extension.Settings] === undefined
                ? option.value
                : settings[option.name as keyof FMG.Extension.Settings]
        ])
    ) as any;
}

/**
 * Get default data.
 */
export function getDefaultData(): FMG.Extension.Settings {
    return fillSettings({});
}

/**
 * Get options
 */
export function getOptions(): FMG.Extension.Option[] {
    return Options as any;
}
