import "proxy-observe";

export class FMG_Data {
    private static autosave: boolean = true;

    private static ignoreKeys: string[] = ["length", "autosave"];

    public locationIds: number[];
    public categoryIds: number[];
    public notes: MG.Note[];
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
            notes:
                data.notes?.map((note) => {
                    note.color = note.color ?? null;
                    note.category = note.category ?? null;
                    return note;
                }) ?? [],
            presets: data.presets ?? [],
            presetOrder: data.presetOrder ?? [],
            visibleCategoriesIds: data.visibleCategoriesIds ?? []
        } as FMG.Storage.V2.StorageObject;

        Object.defineProperty(obj, "callback", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: FMG_Data.createCallback(callback)
        });

        const dataObj = Object.setPrototypeOf(
            obj,
            FMG_Data.prototype
        ) as FMG_Data;

        return Object.deepObserve(dataObj, dataObj.callback);
    }

    /**
     * Creates a callback that will be called when the data changes.
     * @param callback the callback to call when the data changes.
     * @returns the callback that will be called when the data changes.
     */
    private static createCallback(
        callback: () => void
    ): (changes: ProxyObserve.Change[]) => void {
        let timer: number;
        let totalChanges: ProxyObserve.Change[] = [];
        let totalSkippedChanges: ProxyObserve.Change[] = [];

        function pushChanges(changes: ProxyObserve.Change[], skipped = false) {
            // Clear previous timer
            window.clearTimeout(timer);

            // Add changes to the total changes/skipped changes
            if (skipped) totalSkippedChanges.push(...changes);
            else totalChanges.push(...changes);

            // Set a new timer
            timer = window.setTimeout(() => {
                // Log the changes
                logger.debug("Data changed", {
                    changes: totalChanges,
                    skippedChanges: totalSkippedChanges
                });

                // Only call the callback if there are changes that are not ignored
                if (totalChanges.length > 0) {
                    callback();
                }

                // Reset the changes
                totalChanges = [];
                totalSkippedChanges = [];
            }, 200);
        }

        return (changes: ProxyObserve.Change[]) => {
            pushChanges(
                changes,
                !FMG_Data.autosave ||
                    changes.every((change) =>
                        FMG_Data.ignoreKeys.includes(change.name)
                    )
            );
        };
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
