declare namespace FMG {
    namespace Storage {
        namespace V2 {
            interface StorageObject {
                locationIds: number[];
                categoryIds: number[];
                notes: MG.Note[];
                presets: MG.Preset[];
                presetOrder: MG.PresetOrder;
                visibleCategoriesIds: number[];
            }

            interface ExportedJson {
                version: 2;
                gameId: number;
                mapId: number;
                userId: number;
                data: DeepPartial<StorageObject>;
            }
        }
    }
}
