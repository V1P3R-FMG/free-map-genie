declare namespace FMG {
    namespace Storage {
        namespace V3 {
            interface DataStorageObject extends Data {}

            interface SettingsStorageObject extends Settings {}

            interface Data {
                locations: DictById<boolean>;
                categories: DictById<boolean>;
            }

            interface Settings {
                remember_categories: boolean;
            }
        }
    }
}
