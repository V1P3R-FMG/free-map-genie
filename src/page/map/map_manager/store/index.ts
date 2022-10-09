import EventEmitter, { DataEvent, EventCallback } from "../../../../shared/event_emitter";
import FMG_Storage from "../storage";
import FMG_State from "./state";

export class StoreMarkEvent extends DataEvent {
	constructor(id: MG.Id, marked: boolean) { super("mark", { id, marked }); }
}

export class StoreTrackEvent extends DataEvent {
	constructor(id: MG.Id, tracked: boolean) { super("track", { id, tracked }); }
}

export class StoreUpdatedEvent extends DataEvent {
	constructor() { super("updated"); }
}

export default class FMG_Store extends EventEmitter {

    private readonly window: MG.Map.Window;
    private readonly map: MG.MapObject;
    private readonly gameId: number;

    private readonly store: MG.Store;
    public readonly state: FMG_State;

    constructor(window: MG.Map.Window, storage: FMG_Storage) {
		super();

        this.window = window;
        this.map = window.map;
        this.gameId = window.game.id;

        this.store = window.store;
        this.state = new FMG_State(window, storage);
    }

    markLocation(id: MG.Id, found: boolean = true) {
        id = parseInt(id as string);
        this.map.setFeatureState({ source: "locations-data", id }, { found });
        if (this.gameId === 80) this.map.setFeatureState({ source: "circle-locations-data", id }, { found });
		this.emit(new StoreMarkEvent(id, found));
    }

    trackCategory(id: MG.Id, track: boolean = true) {
        let type = track ? "HIVE:USER:ADD_TRACKED_CATEGORY" : "HIVE:USER:REMOVE_TRACKED_CATEGORY";
        this.store.dispatch({ type, meta: { categoryId: parseInt(id as string) } });
		this.emit(new StoreTrackEvent(id, track));
    }

    addPreset(preset: MG.Preset) {
        this.store.dispatch({ type: "HIVE:USER:ADD_PRESET", meta: { preset } });
    }

    deletePreset(presetId: MG.Id) {
        this.store.dispatch({ type: "HIVE:USER:DELETE_PRESET", meta: { presetId } });
    }

    reorderPresets(ordering: MG.PresetOrder) {
        let presets = [];
        for (let preset of this.state.user.presets) {
            presets[ordering.indexOf(preset.id)] = preset;
        }
    }

    showAllCategories() {
        this.store.dispatch({ type: "HIVE:MAP:SHOW_ALL_CATEGORIES" });
    }

    hideAllCategories() {
        this.store.dispatch({ type: "HIVE:MAP:HIDE_ALL_CATEGORIES" });
    }

    showCategories(visibilities: MG.DictById<boolean>) {
        this.store.dispatch({ type: "HIVE:MAP:SET_CATEGORIES_VISIBILITY", meta: { visibilities } });
    }

    setRememberCategories(remembered: boolean) {
		// console.log("set remebered!", remembered);

        const $label = $(this.window.document).find("label[for='remember-categories-checkbox']");
        const $div = $label.closest(".checkbox-wrapper");

		// console.log(!$label, $div);
        const label = $label.get(0);
        if (!label) return;
            
		const image = this.window.getComputedStyle(label, ":after").webkitMaskImage;
		const checked = image != "none" && image != "";

		// console.log(checked, !!remembered);

		if (!!remembered != checked) {
			$div.trigger("click");
		}
    }

    reactUpdate() {
        this.store.dispatch({type: "HIVE:MAP:UPDATE_CATEGORY", meta: { category: {} } }); //Force a react update
    }

	on(name: "mark", f: EventCallback<StoreMarkEvent>): void;
	on(name: "track", f: EventCallback<StoreTrackEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f); }
}