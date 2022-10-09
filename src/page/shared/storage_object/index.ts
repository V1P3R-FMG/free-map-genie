import isEmpty from "../is_empty";
import deepCopy from "./deep_copy";
import deepMerge from "./deep_merge";
import minimize from "./minimize";
import reactive from "./reactive";

export class FMG_StorageKeys {

    keyV5: string;
    keyV4: string;
    keyV3Data: string;
    keyV3Settings: string;

    constructor(gameId: number, mapId: number, userId: number) {
        this.keyV5          = `mg:game_${gameId}:user_${userId}:v5`;
        this.keyV4          = `mg:game_${gameId}:user_${userId}`;
        this.keyV3Data      = `mg:data:game_${gameId}`;
        this.keyV3Settings  = `mg:settings:game_${gameId}`;
    }
}

function createDefaultStorageObject(maps: Array<MG.Map>) {

	const defaultStorageObject = {
		sharedData: {} as StorageSharedDataObject_v5, 
		mapData: {} as MG.DictById<StorageMapDataObject_V5>,
		settings: {} as MG.DictById<StorageSettingsObject_V5>
	};

	defaultStorageObject.sharedData.locations = {};

	maps.forEach(map => {
		defaultStorageObject.mapData[map.id] = {
			categories: {},
			presets: {},
			presets_order: [],
			visible_categories: {},
		}
	
		defaultStorageObject.settings[map.id] = {
			remember_categories: false,
		}
	});

	return defaultStorageObject;
}

function combineData<T extends object[]>(...objects: [...T]): Spread<T> {

    function alterMainObject(key: string, value: any) {
        objects.forEach((o: Dict<string, any>) => {
            if (typeof o[key] !== "undefined") {
                if (typeof value === undefined) {
                    delete o[key];
                } else {
                    o[key] = value;
                }
            }
        });
    } 

    return new Proxy(Object.assign({}, ...objects), {
        set(obj: Dict<string, any>, key: string, value: any) {
            alterMainObject(key, value);
            obj[key] = value;
            return true;
        },
        deleteProperty(obj: Dict<string, any>, key: string) {
            alterMainObject(key, undefined);
            delete obj[key];
            return true;
        }
    }) as Spread<T>;
}

export default class FMG_StorageObject {

	private loaded: boolean=false;
    protected keys?: FMG_StorageKeys;
    protected mapId?: number;
    protected local?: Storage;

	private dfltStorageObject?: StorageObject_V5;

    private _autosave: boolean = true;
    
    private object?: StorageObject_V5;
    private _data?: StorageDataObject_V5;
    private _settings?: StorageSettingsObject_V5;
	
	load(window: MG.Map.Window) {
		this.loaded = true;
		this.local = window.localStorage;
		this.mapId = window.mapData.map.id;
		this.keys = new FMG_StorageKeys(window.game.id, this.mapId, window.user.id);
		this.dfltStorageObject = createDefaultStorageObject(window.mapData.maps);

		this.reload();
		this.filterStorageDataObject(window.mapData);
	}

    set data(_) { throw new Error("the key data is readonly"); }

    get data(): LocalStorageDataObject_V5 { return this._data || {}; }

    get settings(): LocalStorageSettingsObject_V5 { return this._settings || {}; }

    set settings(_) { throw new Error("the key settings is readonly"); }

    get autosave() { return this._autosave; }

    get v5(): LocalStorageObject_V5 {
		this.loadedCheck();
        return this.getJSON(this.keys?.keyV5 as string) as LocalStorageObject_V5;
    }

    get v4(): LocalStorageObject_V4 {
		this.loadedCheck();
        return this.getJSON(this.keys?.keyV4 as string) as LocalStorageObject_V4;
    }

    set autosave(autosave: boolean) {
        this._autosave = autosave;
        if (autosave) this.save();
    }

	private loadedCheck() {
		if (!this.loaded) throw new Error("no window has been loaded yet!");
	}

    private restoreV3DataObject() {
		this.loadedCheck();

        const v3Data = this.getJSON<LocalStorageDataObject_V3>(this.keys?.keyV3Data as string);

        // if it's empty retrun, no old versions to find
        if (isEmpty(v3Data)) return;

        // if it isn't empty save the data to the v4 key
        this.setJSON(this.keys?.keyV4 as string, { data: v3Data });

        // remove old v3 data we don't need it anymore all stuff is transfered to v4
        this.local?.removeItem(this.keys?.keyV3Data as string);
        this.local?.removeItem(this.keys?.keyV3Settings as string);
    }

    private restoreV4DataObject() {
		this.loadedCheck();

        var v4Object = this.getJSON<LocalStorageObject_V4>(this.keys?.keyV4 as string);

        // if allready loaded this map once before don't load it again
        if (v4Object.old_data_loaded?.includes(this.mapId)) return;

        // if it's emtpy try to to find 
        if (isEmpty(v4Object)) {
            this.restoreV3DataObject();
            v4Object = this.getJSON<LocalStorageObject_V4>(this.keys?.keyV4 as string);
        }

        // if we have data save that data to the v5 key
        if (v4Object.data) {
            const oldDataLoaded = v4Object.old_data_loaded = v4Object.old_data_loaded || [];
            oldDataLoaded.push(this.mapId);

            this.setJSON(this.keys?.keyV4 as string, v4Object);

            this.setJSON(this.keys?.keyV5 as string, { data: v4Object.data });
        }
    }

    reload() {
		this.loadedCheck();

        var v5Object = this.getJSON<LocalStorageObject_V5>(this.keys?.keyV5 as string) || {};

        // if it's empty try to find old v4 data and restore it
        if (isEmpty(v5Object)) {
            this.restoreV4DataObject();
            v5Object = this.getJSON<LocalStorageObject_V5>(this.keys?.keyV5 as string);
        }

        const object = deepMerge<StorageObject_V5>(deepCopy(this.dfltStorageObject as StorageObject_V5), v5Object);

        this.object = reactive(object, this.saveCheck.bind(this));

		if (!this.object) throw Error("Somthing unexpected happend!");

		this._data = combineData(this.object.mapData[this.mapId as number], this.object.sharedData);
		this._settings = this.object.settings[this.mapId as number];
    }

    filterStorageDataObject(mapData: MG.MapData) {
		this.loadedCheck();

        const categories = mapData.categories;
        
        //remove categories that don't belong to this map
        const dataCategories = this._data?.categories;
        for (const catId in dataCategories) {
            if (!categories[catId]) delete dataCategories?.[catId];
        }
    
        //remove presets that don't belong to this map
        const dataPresets = this._data?.presets;
        const dataPresetsOrder = this._data?.presets_order;
        for (const presetId in dataPresets) {
            for (const catId of dataPresets[presetId]?.categories || []) {
                if (!categories[catId]) {
                    delete dataPresets[presetId];
                    dataPresetsOrder?.splice(dataPresetsOrder?.indexOf(parseInt(presetId)), 1);
                }
            }
        }
    
        //remove visible categories that don't belong to this map
        const dataVisibleCategories = this._data?.visible_categories;
        for (const catId in dataVisibleCategories) {
            if (!categories[catId]) delete dataVisibleCategories?.[parseInt(catId)];
        }
    }

    protected setJSON<T = any>(key: string, value: T, defaultValue?: T) {
		this.loadedCheck();

        if (typeof value === "object" && typeof defaultValue === "object") value = minimize(value as object, defaultValue as object);
        else if (typeof value === "undefined" && typeof defaultValue !== "undefined") value = defaultValue;

        if (typeof value !== "undefined") this.local?.setItem(key, JSON.stringify(value));
        else this.local?.removeItem(key);
    }
    
    protected getJSON<T extends object=object>(key: string, backupOnFail: boolean=true): DeepPartial<T> {
		this.loadedCheck();

        try {
            return JSON.parse(this.local?.getItem(key) || "{}") as DeepPartial<T>;
        } catch (e) {
            if (backupOnFail) {
                //Create a backup of the invalid data in case the user wants to fix it
                const invalidStorageData = this.local?.getItem(key);
                if (typeof invalidStorageData === "string") {
                    const dateISOString = new Date().toISOString();
                    this.local?.removeItem(key);
                    this.local?.setItem(`${key}:backup:[${dateISOString}]`, invalidStorageData);
                    console.error("[LOAD ERROR]:", e);
                }
            }
        }
        return {} as DeepPartial<T>;
    }

    save() {
        this.loadedCheck();
        this.setJSON(this.keys?.keyV5 as string, this.object, this.dfltStorageObject);
    }

    saveCheck() {
        if (this._autosave) this.save();
    }

	import(jsonObject: JSONGameDataWithVersion_V4|JSONGameData_V5) {
		this.loadedCheck();

        switch(jsonObject.version) {
            case "v4":

				if (!isEmpty(this.v4)) {
					if (!confirm("MapData is not empty, Do you want to override your current MapData!")) {
						return;
					}
				}

				this.setJSON(this.keys?.keyV4 as string, jsonObject.mapdata);
                break

            case "v5":

				if (!isEmpty(this.v5)) {
					if (!confirm("MapData is not empty, Do you want to override your current MapData!")) {
						return;
					}
				}

                if (jsonObject.v4StorageObject) this.setJSON(this.keys?.keyV4 as string, jsonObject.v4StorageObject);
                if (jsonObject.storageObject) this.setJSON(this.keys?.keyV5 as string, jsonObject.storageObject);
                break

            default:
                throw new Error("Invalid JSON Object");
        }
        this.reload();
    }

    clear() {
		this.loadedCheck();
        this.local?.removeItem(this.keys?.keyV5 as string);
    }
}