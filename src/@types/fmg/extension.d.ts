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
            total_progress_bar_legacy_mode: boolean;
            import_safety: boolean;
            custom_search_bar: boolean;
            mock_user: boolean;
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
