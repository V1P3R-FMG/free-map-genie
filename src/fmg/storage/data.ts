export class Data {
    public locations: DictById<boolean>;
    public categories: DictById<boolean>;
    public presets: DictById<MG.Preset>;
    public preset_order: MG.PresetOrder;
    public visible_categories: DictById<boolean>;

    public constructor(data: Partial<FMG.Storage.V6.Data>) {
        this.locations = data.locations || {};
        this.categories = data.categories || {};
        this.presets = data.presets || {};
        this.preset_order = data.preset_order || [];
        this.visible_categories = data.visible_categories || {};
    }
}
