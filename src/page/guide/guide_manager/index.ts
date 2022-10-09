import EventEmitter, { DataEvent, EventCallback } from "../../../shared/event_emitter";
import FMG_Map from "../../map/index";
import FMG_CheckboxManager from "./checkbox_manager/index";
import FMG_GuideStorage from "./storage";

export class GuideManagerLoadEvent extends DataEvent<{ map: FMG_Map }> {
	constructor(map: FMG_Map) { super("load", { map }); }
}

export default class FMG_GuideManager extends EventEmitter {

    public readonly window: MG.Guide.Window;
    public readonly document: Document;

    public readonly checkboxManager: FMG_CheckboxManager;

	public readonly storage: FMG_GuideStorage;
    
    public mapWindow?: MG.Map.Window;
    public fmgMap?: FMG_Map;

    constructor(window: MG.Guide.Window) {
		super();

        this.window = window;
        this.document = window.document;

		this.storage = new FMG_GuideStorage();

        this.checkboxManager = new FMG_CheckboxManager(this);

        $(this.document).find("iframe[src*='https://mapgenie.io']").on("load", () => this._setupMap());
    }

    private async _setupMap() {
        return Promise.resolve()
            .then(async () => {
                var i = 0; do {
                    this.mapWindow = this.window[i] as MG.Map.Window|undefined;
                    if (this.mapWindow) break;
                    i++
                } while(this.mapWindow);
        
                if (this.mapWindow) {
                    this.fmgMap = new FMG_Map(this.mapWindow);
					await this.fmgMap?.ready();

					this.storage.load(this.mapWindow);

					this.emit(new GuideManagerLoadEvent(this.fmgMap));

					this.fmgMap?.on("updated", () => this.reload());
                }
        
                return this.fmgMap || null;
            })
            .then(fmgMap => fmgMap?.init());
    }

    reset() {
        this.checkboxManager.clear();
    }

    load() {
		this._setupMap()
			.then(() => this.reload());
    }

    reload() {
        this.reset();
		this.storage.reload();
		for (const id in this.storage.data.locations) {
			this.checkboxManager.markLocation(id, true);
		}
    }

    markLocation(id: MG.Id, found: boolean) {
		this.checkboxManager.markLocation(id, found);
    }

	on(name: "load", f: EventCallback<GuideManagerLoadEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f); }
}