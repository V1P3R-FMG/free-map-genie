import "proxy-observe";

export class FMG_Data {
    private static autosave: boolean = true;

    private static ignoreKeys: string[] = ["length"];

    public locationIds: number[];
    public categoryIds: number[];
    public presets: MG.Preset[];
    public presetOrder: number[];
    public visibleCategoriesIds: number[];

    private callback: (changes: ProxyObserve.Change[]) => void;

    private constructor() {
        throw new Error("Cannot instantiate Data");
    }

    public static create(
        data: Partial<FMG.Storage.V2.StorageObject>,
        callback: () => void
    ): FMG_Data {
        const obj = {
            locationIds: data.locationIds ?? [],
            categoryIds: data.categoryIds ?? [],
            presets: data.presets ?? [],
            presetOrder: data.presetOrder ?? [],
            visibleCategoriesIds: data.visibleCategoriesIds ?? []
        } as FMG.Storage.V2.StorageObject;

        Object.defineProperty(obj, "callback", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: (changes: ProxyObserve.Change[]) => {
                const skip = changes.every((change) =>
                    FMG_Data.ignoreKeys.includes(change.name)
                );
                logger.debug("Data changed", {
                    autosave: FMG_Data.autosave,
                    skipped: skip,
                    changes
                });
                if (skip) return;
                if (!FMG_Data.autosave) return;
                callback();
            }
        });

        const dataObj = Object.setPrototypeOf(
            obj,
            FMG_Data.prototype
        ) as FMG_Data;

        return Object.deepObserve(dataObj, dataObj.callback);
    }

    get autosave(): boolean {
        return FMG_Data.autosave;
    }

    set autosave(enabled: boolean) {
        FMG_Data.autosave = enabled;
    }

    get locations(): DictById<boolean> {
        const locations = Object.fromEntries(
            this.locationIds.map((id) => [id, true])
        );
        return Object.observe(locations, (changes) => {
            this.locationIds = Object.keys(locations).map((id) => parseInt(id));
            this.callback(changes);
        });
    }

    get categories(): DictById<boolean> {
        const categories = Object.fromEntries(
            this.categoryIds.map((id) => [id, true])
        );
        return Object.observe(categories, (changes) => {
            this.categoryIds = Object.keys(categories).map((id) =>
                parseInt(id)
            );
            this.callback(changes);
        });
    }

    get visibleCategories(): DictById<boolean> {
        const visibleCategories = Object.fromEntries(
            this.visibleCategoriesIds.map((id) => [id, true])
        );
        return Object.observe(visibleCategories, (changes) => {
            this.visibleCategoriesIds = Object.keys(visibleCategories).map(
                (id) => parseInt(id)
            );
            this.callback(changes);
        });
    }
}
