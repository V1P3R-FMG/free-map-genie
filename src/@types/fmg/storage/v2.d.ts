declare namespace FMG {
    namespace Storage {
        namespace V2 {
            interface StorageObject {
                locationIds: number[];
                categoryIds: number[];
                presets: MG.Preset[];
                preset_order: MG.PresetOrder;
                visible_categories: number[];
            }
        }
    }
}
