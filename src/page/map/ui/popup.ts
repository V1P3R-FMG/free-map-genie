import FMG_MapManager from "../map_manager";


function isPopup(element: HTMLElement) {
	return element.classList.contains("mapboxgl-popup");
}


export class FMG_Popup {

    private readonly _manager: FMG_MapManager;

    private readonly $element: JQuery<HTMLElement>;
    private readonly $input: JQuery<HTMLElement>;

    constructor(manager: FMG_MapManager, element: HTMLElement) {

        this._manager = manager;

        this.$element = $(element);
		this.$input = $(element).find("input");
	}

	set checked(b: boolean) {
		this.$input.prop('checked', b);
	}

	get checked() {
		return this.$input.is(":checked");
	}

	get found() {
		return this._manager.storage.data.locations?.[this.locationId] || false;
	}

	get locationId() {
		return this._manager.store.state.map.selectedLocation?.id || -1;
	}

	update() {
		this.checked = this.found;
	}
}


export default class FMG_PopupObserver {

	private readonly _manager: FMG_MapManager;
	private readonly _observer: MutationObserver;
	
	public popup: FMG_Popup | null;

	constructor(manager: FMG_MapManager) {
		
		this._manager = manager;

		this.popup = null;

		this._observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (isPopup(node as HTMLElement)) {
						this.popup = new FMG_Popup(this._manager, node as HTMLElement)
					};
                });

                mutation.removedNodes.forEach(node => {
                    if (isPopup(node as HTMLElement)) {
						this.popup = null;
					};
                });
            });
        });

		const mapDiv = $(this._manager.window.document.body).find("#map").get(0);
        if (mapDiv) {
            this._observer.observe(mapDiv, {
                childList: true
            });
        } else {
            console.warn("No map div found!");
        }
	}

	update() {
		this?.popup?.update();
	}
}