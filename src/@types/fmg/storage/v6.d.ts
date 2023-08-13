declare namespace FMG {
    namespace Storage {
        namespace V6 {
            interface StorageObject {
                data: DictById<Data>;
                settings: DictById<Settings>;
            }

            interface Data {
                locations: DictById<boolean>;
                categories: DictById<boolean>;
                presets: DictById<MG.Preset>;
                preset_order: MG.PresetOrder;
                visible_categories: DictById<boolean>;
            }

            interface Settings {
                remember_categories: boolean;
            }
        }
    }
}
