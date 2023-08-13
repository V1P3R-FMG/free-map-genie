declare namespace FMG {
    namespace Storage {
        namespace V4 {
            interface StorageObject {
                data: Data;
                settings: Settings;
            }

            interface Data {
                locations: DictById<boolean>;
                categories: DictById<boolean>;
                presets: DictById<MG.Preset>;
                presets_order: MG.PresetOrder;
                visible_categories: DictById<boolean>;
            }

            interface Settings {
                remember_categories: boolean;
            }
        }
    }
}
