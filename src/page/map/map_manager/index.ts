import FMG_MapStorage from "./storage";
import FMG_Store from "./store/index"

function hasFilters(window: MG.Map.Window) {
	return window.visibleLocations || window.visibleCategories;
}

export default class FMG_MapManager {

    private readonly _mapManager: MG.MapManager;
    private readonly _store: MG.Store;
    
    public readonly window: MG.Map.Window;
    public readonly document: Document;
    public readonly mapData: MG.MapData;
    public readonly store: FMG_Store;
    public readonly storage: FMG_MapStorage;
    public readonly settings?: ExtensionSettings;
    
    constructor(window: MG.Map.Window) {

        this.window = window;
        this.document = window.document;
        this.mapData = window.mapData;

        this.storage = new FMG_MapStorage(window);
        this.store = new FMG_Store(window, this.storage);

        this.settings = window.fmgSettings;

        this._mapManager = window.mapManager;
        this._store = window.store;

		
		window.user.hasPro = true;
		window.mapData.maxMarkedLocations = Infinity;
		this.store.reactUpdate();
    }

    load() {
		this.reload();

		//don't load last visible categories if initial filters are set or the map is in mini mode
		if (hasFilters(this.window) || this.window.isMini) return;

		//remember visible categories
		if(this.storage.settings?.remember_categories) {
			this.store.hideAllCategories();
			this.store.showCategories(Object.assign({}, this.storage.data?.visible_categories));
			this.store.setRememberCategories(true);
		} else {
			this.store.setRememberCategories(false);
		}
    }

    reload() {
		this.reset();

        this.storage.reload();

        const data = this.storage.data;

        //locations
        for (var id in data?.locations || {}) {
            this.store.markLocation(id, true);
        }

        //the rest is not necessary if this map is in mini mode
        if (this.window.isMini) return;

        //categories
        for (var id in data?.categories || {}) {
            this.store.trackCategory(id, true);
        }

        //presets
        for (var id in data?.presets || {}) {
            const preset = data?.presets?.[id];
            this.store.addPreset(preset as MG.Preset);
        }

        //presets order
        if (data?.presets_order && data?.presets_order.length > 0) {
            this.store.reorderPresets(data.presets_order);
        }
    }

    waitForMapLoaded() {
        return new Promise(resolve => {
            if (this.window.map.loaded())
                resolve(void 0);
            else {
                let handle = setInterval(() => {
                    if (this.window.map.loaded()) {
                        clearInterval(handle);
                        resolve(void 0);
                    }
                }, 50);
            }
        })
    }

    reset() {
        const state = this._store.getState();

		state.map.locations.forEach(
			loc => this.store.markLocation(loc.id, false));

		
		state.map.categoryIds.forEach (
			catId => this.store.trackCategory(catId, false));
    }

    setFoundLocationsShown(show: boolean) {
        if(this.store.state.user.foundLocationsCount > 0) {
            this._mapManager.setFoundLocationsShown(show);
        }
    }

    applyFilter(filter: MG.MapManager.Filter) {
        this._mapManager.applyFilter(filter);
    }
    
    markLocation(id: MG.Id, found: boolean) {
        this.storage.markLocation(id, found);
        this.store.markLocation(id, found);
    }

    trackCategory(id: MG.Id, track: boolean = true) {
        this.storage.trackCategory(id, track);
        this.store.trackCategory(id, track);
    }

    addPreset(preset: MG.Preset) {
        this.storage.addPreset(preset);
        this.store.addPreset(preset);
    }

    deletePreset(presetId: MG.Id) {
        this.storage.deletePreset(presetId);
        this.store.deletePreset(presetId);
    }

    reorderPresets(ordering: MG.PresetOrder) {
        this.storage.reorderPresets(ordering);
        this.store.reorderPresets(ordering);
    }

    *iFoundLocationsIds() {
        for (var id in this.storage.data?.locations) yield id;
    }

    *iTrackedCateogeriesIds() {
        for (var id in this.storage.data?.categories) yield id;
    }
}