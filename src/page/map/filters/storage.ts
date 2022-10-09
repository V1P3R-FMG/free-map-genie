import FMG_StorageFilter, { Handlers } from "../../shared/filters/storage";
import FMG_MapManager from "../map_manager";
import toggle from "../../shared/key_toggle";

type Handler = (this: FMG_MapStorageFilter, name: string, key: string, value: any) => boolean;

function getId(key: string) {
    return key.match(/(\d+)$/)?.[1];
}

const handleVisibleCategories = function(visible_categories: MG.DictById<boolean>, key: string, remove: boolean) {
    const id = getId(key);
	
    if (id) {
		toggle(visible_categories, id, !remove);
    }
}

const RemoveHandler: Dict<string, Handler> = {
    visible_categories(_, key) {
        handleVisibleCategories(this.manager.storage.data?.visible_categories || {}, key, true);
        return true;
    },

    remember_categories() {

        const storage = this.manager.storage

        storage.autosave = false;

        if (storage.settings) storage.settings.remember_categories = false;

        if (storage.data) storage.data.visible_categories = {};

        storage.autosave = true;

        return true;
    }
}

const SetHandler: Dict<string, Handler> = {
    visible_categories(_, key) {
        handleVisibleCategories(this.manager.storage.data?.visible_categories || {}, key, false);
        return true;
    },

    remember_categories() {
        const settings = this.manager.storage.settings;
        if (settings) settings.remember_categories = true;
        return true;
    }
}

export default class FMG_MapStorageFilter extends FMG_StorageFilter {

    public readonly manager: FMG_MapManager

    constructor(manager: FMG_MapManager) {
        super(manager.window.localStorage, {
			set: SetHandler as Handlers,
			remove: RemoveHandler as Handlers
		});

        this.manager = manager;
    }
}