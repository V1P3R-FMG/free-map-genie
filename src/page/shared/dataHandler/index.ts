import isEmpty from "../is_empty";
import EventEmitter, { DataEvent, EventCallback } from "../../../shared/event_emitter";
import FMG_StorageObject from "../storage_object";
import FMG_JSONMapDataFileReader from "./json_reader";

export class ImportEvent extends DataEvent {
	constructor() { super("import"); }
}

export class ExportEvent extends DataEvent {
	constructor() { super("export"); }
}

export class ClearEvent extends DataEvent {
	constructor() { super("clear"); }
}

export class UpdatedEvent extends DataEvent {
	constructor() { super("updated"); }
}

export default class FMG_DataHandler extends EventEmitter {

	public readonly gameId: number;
	public readonly userId: number;
	public readonly gameTitle: string;

	private readonly storageObject: FMG_StorageObject;
	private readonly jsonReader: FMG_JSONMapDataFileReader;

	constructor(mapWindow: MG.Map.Window, storageObject: FMG_StorageObject) {
		super();

		this.gameId = mapWindow.game.id;
		this.userId = mapWindow.user.id;

		this.storageObject = storageObject;

		this.jsonReader = new FMG_JSONMapDataFileReader(mapWindow);

		this.gameTitle = mapWindow.game.title;

		window.addEventListener("message", (e) => {
            switch(e.data.type) {
                case "fmg:map:import":
                    this.import();
                    break
                case "fmg:map:export":
                    this.export();
                    break
                case "fmg:map:clear":
                    this.clear();
                    break
            }
        });
	}

	private error(message: string) {
		const toastr = (window as MG.Map.Window | MG.Guide.Window).toastr
		if (toastr) toastr.error(message); 
	}

	clear() {

        if (!confirm(`Are you sure you want to clear your map data for Game(${this.gameTitle})?`)) return;
		this.storageObject.clear();

		this.emit(new ClearEvent());
		this.emit(new UpdatedEvent());
    }

    export() {
        const v5StorageObject = this.storageObject.v5;
        const v4StorageObject = this.storageObject.v4;
        if (!(v5StorageObject || v4StorageObject)) return this.error("This map has no saved data");

        const json: Partial<JSONGameData_V5> = {};
        json.version = "v5";
        json.gameId = this.gameId;
        json.userId = this.userId;
        if (!isEmpty(v5StorageObject)) json.storageObject = v5StorageObject;
        if (!isEmpty(v4StorageObject)) json.v4StorageObject = v4StorageObject;

        const url = URL.createObjectURL(new Blob([JSON.stringify(json)], {
            type: "text/plain;charset=utf-8"
        }));

        const a = $("<a>").attr({
            href: url,
            download: `fmg_game_${this.gameId}_user_${this.userId}_${new Date().toISOString()}.json`,
        })
        .appendTo(document.body)
        .get(0);

        a?.click();
    
        setTimeout(function () {
            a?.remove();
            window.URL.revokeObjectURL(url);
        });

		this.emit(new ExportEvent());
		this.emit(new UpdatedEvent());
    }

    import() {
        const $filebrowser = $("<input>").attr("type", "file").trigger("click");

        $filebrowser.on("change", () => {
            const file = $filebrowser.prop("files")?.[0];
            if (!file) return this.error("No file selected");

            this.jsonReader.readAsText(file).then(jsonObject => { 
                $filebrowser.remove();
                if (jsonObject) this.storageObject.import(jsonObject);
				this.emit(new ImportEvent());
				this.emit(new UpdatedEvent());
            }).catch(e => this.error(e));
        });
    }

	on(name: "import", f: EventCallback<ImportEvent>): void;
	on(name: "export", f: EventCallback<ExportEvent>): void;
	on(name: "clear", f: EventCallback<ClearEvent>): void;
	on(name: "updated", f: EventCallback<UpdatedEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f); }

}