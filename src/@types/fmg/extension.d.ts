declare namespace FMG {
    namespace Extension {
        interface CheckboxOption {
            type: "checkbox";
            value: boolean;
            name: string;
            label: string;
            tooltip: string;
        }

        type Option = CheckboxOption;

        interface Settings {
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

        interface Data {
            settings: Settings;
            bookmarks: Bookmarks;
        }
    }
}
