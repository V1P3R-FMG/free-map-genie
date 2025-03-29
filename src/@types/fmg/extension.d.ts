declare namespace FMG {
    namespace Extension {
        interface Option<T extends string = string, value = any> {
            type: string;
            value: boolean;
            name: string;
            label: string;
            tooltip: string;
        }

        interface CheckboxOption extends Option<"checkbox", boolean> {}

        interface Settings {
            extension_enabled: boolean;
            presets_allways_enabled: boolean;
            mock_user: boolean;
            no_confirm_mark_unmark_all: boolean;
        }

        interface BookmarkData {
            title: string;
            url: string;
            favicon: string;
        }

        type Bookmarks = BookmarkData[];
    }
}
