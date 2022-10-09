import EventEmitter, { DataEvent, EventCallback } from "../../shared/event_emitter";
import FMG_DataHandler from "../shared/dataHandler";
import FMG_GuideAxiosFilter from "./filters/axios";
import FMG_GuideManager from "./guide_manager/index";

export class GuideUpdatedEvent extends DataEvent {
	constructor() { super("updated"); }
}

export default class FMG_Guide extends EventEmitter {

	public readonly guideManager: FMG_GuideManager;

	public readonly axiosFilter: FMG_GuideAxiosFilter;

	public dataHandler?: FMG_DataHandler;

    constructor(window: MG.Guide.Window) {
		super();

		this.guideManager = new FMG_GuideManager(window);

		this.axiosFilter = new FMG_GuideAxiosFilter(this.guideManager);

		this.guideManager.on("load", (e) => {
			const map = e.data?.map;
			if (map) { 
				this.dataHandler = new FMG_DataHandler(map.mapManager.window, this.guideManager.storage);
			}
		});
    }

    init() {
		this.guideManager.window.isPro = true;

        return this.guideManager.load();
    }

	reload() {
		this.guideManager.reload();
	}

	on(name: "updated", f: EventCallback<GuideUpdatedEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f); }
}