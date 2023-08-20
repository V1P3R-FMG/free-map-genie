import { FMG_LocalStorageDriver } from "./local-storage";

export class FMG_Drivers {
    public static newLocalStorageDriver(
        window: Window
    ): FMG_LocalStorageDriver {
        return new FMG_LocalStorageDriver(window);
    }

    public static new(window: Window, name: string): FMG.Storage.Driver {
        name = name.toLowerCase();
        switch (name) {
            case "localstorage":
                return FMG_Drivers.newLocalStorageDriver(window);
            default:
                throw new Error(`Unknown driver: ${name}`);
        }
    }
}
