import { FMG_Storage } from "@fmg/storage";
import { FMG_Store } from "@fmg/store";
import { FMG_KeyDataHelper } from "@fmg/storage/helpers/key-data";

export class FMG_MapManager {
    public window: Window;
    public storage: FMG_Storage;
    public store: FMG_Store;

    public constructor(window: Window) {
        this.window = window;
        this.storage = new FMG_Storage(
            window,
            FMG_KeyDataHelper.fromWindow(window)
        );
        this.store = FMG_Store.install(window, this.storage);
    }

    public async load() {
        await this.storage.load();
    }
}
