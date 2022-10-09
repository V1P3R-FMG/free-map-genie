import FMG_AxiosFilter, { RequestHandlers }  from "../../shared/filters/axios";
import FMG_MapManager from "../map_manager";

type Handler = (this: FMG_MapAxiosFilter, key: string, id: number, data: any, url: string) => void;

type PresetPostData = {
    categories: Array<number>,
    game_id: number,
    ordering: Array<number>,
    tags: {},
    title: string,
}

type PresetsReorderPostData = {
    ordering: MG.PresetOrder
}

const handleLocation: Handler = function(_, id) {
    const isMarked = this.manager.storage.data?.locations?.[id];
    try {
		this.manager.storage.markLocation(id, !isMarked);
	} catch (e) {
		console.error(e);
	}
    this.manager.store.markLocation(id, !isMarked);
}

const handleCategory: Handler = function(_, id, data?: { category: number }) {
    id = data?.category || id;
    const isTracked = this.manager.storage.data?.categories?.[id];
    this.manager.storage.trackCategory(id, !isTracked);
    this.manager.store.trackCategory(id, !isTracked);
}

const PutHandler: Dict<string, Handler> = {
    locations: handleLocation
}

const PostHandler: Dict<string, Handler> = {
    presets(_, __, data: PresetPostData & { id?: number }) {

        const presets = this.manager.storage.data?.presets || {};

        data.id = 0;
        while (presets[data.id]) data.id++;

        this.manager.storage.addPreset({
            id: data.id,
            title: data.title,
            order: data.ordering.length - 1,
            categories: data.categories,
        });

        return { data };
    },

    presets_reorder(_, __, data: PresetsReorderPostData) {
        this.manager.storage.reorderPresets(data.ordering);
    },

    categories: handleCategory
}

const DeleteHandler: Dict<string, Handler> = {
    presets(_, id) {
        this.manager.storage.deletePreset(id);
    },

    locations: handleLocation,

    categories: handleCategory
}

export default class FMG_MapAxiosFilter extends FMG_AxiosFilter {

    public readonly manager: FMG_MapManager

    constructor(manager: FMG_MapManager) {
        super(manager.window.axios, {
			put: PutHandler as RequestHandlers,
			post: PostHandler as RequestHandlers,
			delete: DeleteHandler as RequestHandlers
		});

        this.manager = manager;
    }
}