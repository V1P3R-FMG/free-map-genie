type BooleanTrueString = "1" | "true";
type BooleanFalseString = "0" | "false";
type BooleanString = BooleanFalseString | BooleanFalseString;

interface IProcessEnv {
    PORT?: string;
    IP?: string;
    CACHE_MAX_AGE?: string;
    MAX_BACKUPS_COUNT?: string;
    OVERRIDE_SERVER_URL?: string;

    ADB_HOST?: string;
    ADB_PORT?: string;
    ADB_BIN?: string;
    ANDROID_DEVICE?: string;

    START_URL?: string;
    CHROME_BIN?: string;
    FIREFOX_BIN?: string;
    FIREFOX_APK?: string;

    CHROMIUM_PROFILE?: string;
    FIREFOX_PROFILE?: string;
    KEEP_CHANGES?: BooleanString;
}

declare namespace NodeJS {
    interface ProcessEnv extends IProcessEnv {}
}
