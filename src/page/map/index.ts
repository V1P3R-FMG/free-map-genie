import FMG_DataHandler from "../shared/dataHandler";
import EventEmitter, { DataEvent, EventCallback } from "../../shared/event_emitter";
import FMG_MapManager from "./map_manager";

import { FMG_MINI_UI, FMG_UI } from "./ui/index";

import FMG_MapAxiosFilter from "./filters/axios";
import FMG_MapStorageFilter from "./filters/storage";

import debounce from "../shared/debounce";

export class MapUpdatedEvent extends DataEvent {
	constructor() { super("updated"); }
}

export default class FMG_Map extends EventEmitter {

	public readonly mapManager: FMG_MapManager;

	public readonly ui: FMG_UI | FMG_MINI_UI;
    public readonly axiosFilter: FMG_MapAxiosFilter;
    public readonly storageFilter: FMG_MapStorageFilter;
	public readonly dataHandler: FMG_DataHandler;

    constructor(window: MG.Map.Window) {
		super();

		this.mapManager = new FMG_MapManager(window);
		this.ui = window.isMini ? new FMG_MINI_UI(this.mapManager) : new FMG_UI(this.mapManager);

		this.axiosFilter = new FMG_MapAxiosFilter(this.mapManager);
		this.storageFilter = new FMG_MapStorageFilter(this.mapManager);

		this.dataHandler = new FMG_DataHandler(window, this.mapManager.storage);

		const update = debounce(() => {
			this.ui.update();
			this.emit(new MapUpdatedEvent());
		}, 150);

		const reload = debounce(() => {
			console.log("reload");
			this.reload();
			this.emit(new MapUpdatedEvent());
		}, 150);

		this.dataHandler.on("updated", reload);

		this.mapManager.store.on("mark", update)
		this.mapManager.store.on("track", update);
		this.axiosFilter.on("block", update);
	}

    async ready() {
		const window = this.mapManager.window;
		
        await new Promise(resolve => {
            if (window.map.loaded())
                resolve(void 0);
            else {
                let handle = setInterval(() => {
                    if (window.map.loaded()) {
                        clearInterval(handle);
                        resolve(void 0);
                    }
                }, 50);
            }
        })
    }

	async init() {
		await this.ready();

		this.mapManager.load();
		this.ui.update();
	}

	reload() {
		this.mapManager.reload();
	}

	on(name: "updated", f: EventCallback<MapUpdatedEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f); };
}