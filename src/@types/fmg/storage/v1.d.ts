declare namespace FMG {
    namespace Storage {
        namespace V1 {
            interface StorageObject {
                sharedData: SharedData;
                mapData: DictById<Data>;
                settings: DictById<Settings>;
            }

            interface SharedData {
                locations: DictById<boolean>;
            }

            interface Data {
                categories: DictById<boolean>;
                presets: DictById<MG.Preset>;
                presets_order: MG.PresetOrder;
                visible_categories: DictById<boolean>;
            }

            interface Settings {
                remember_categories: boolean;
            }

            interface ExportedJson {
                version: "v5";
                gameId: number;
                userId: number;
                storageObject: DeepPartial<StorageObject>;
            }
        }
    }
}
