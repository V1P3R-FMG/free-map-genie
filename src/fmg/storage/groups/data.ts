export class Data {
    public locationIds: number[];
    public categoryIds: number[];
    public presets: MG.Preset[];
    public preset_order: MG.PresetOrder;
    public visible_categories: Id[];

    public constructor(data: DeepPartial<FMG.Storage.V2.StorageObject>) {
        this.locationIds = data.locationIds ?? [];
        this.categoryIds = data.categoryIds ?? [];
        this.presets = data.presets ?? [];
        this.preset_order = data.preset_order ?? [];
        this.visible_categories = data.visible_categories ?? [];
    }

    get categories(): DictById<boolean> {
        return Object.fromEntries(this.categoryIds.map((id) => [id, true]));
    }

    get locations(): DictById<boolean> {
        return Object.fromEntries(this.locationIds.map((id) => [id, true]));
    }
}
