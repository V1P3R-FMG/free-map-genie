declare namespace FMG {
    namespace Storage {
        namespace V2 {
            interface StorageObject {
                locationIds: number[];
                categoryIds: number[];
                presets: MG.Preset[];
                presetOrder: MG.PresetOrder;
                visibleCategories: number[];
            }
        }
    }
}
