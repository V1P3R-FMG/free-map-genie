import FMG_MapManager from "../map_manager";

export default class FMG_MarkControls {

    private readonly manager: FMG_MapManager;

    private readonly $element: JQuery<HTMLElement>;
    private readonly $markAll: JQuery<HTMLElement>;
    private readonly $unmarkAll: JQuery<HTMLElement>;

    constructor(manager: FMG_MapManager) {

        this.manager = manager;

        this.$element = $(`<div class="mapboxgl-ctrl mapboxgl-ctrl-group">
            <button class="mg-mark-all-control" type="button" title="Mark all" aria-label="Mark all" aria-disabled="false">
                <span class="mapboxgl-ctrl-icon ion-md-add-circle" aria-hidden="true"></span>
            </button>
            <button class="mg-unmark-all-control" type="button" title="UnMark all" aria-label="Unmark all" aria-disabled="false">
                <span class="mapboxgl-ctrl-icon ion-md-close-circle" aria-hidden="true"></span>
            </button>
        </div>`);

        this.$markAll = this.$element.find(".mg-mark-all-control");
        this.$unmarkAll = this.$element.find(".mg-unmark-all-control");

        this.$markAll.on("click", () => this.markVisibleLocations(true));
        this.$unmarkAll.on("click", () => this.markVisibleLocations(false));

        this.$element.insertAfter($(manager.window.document).find("#add-note-control"));
    }

    markVisibleLocations(found: boolean) {

        //Confirm if the user want's to unmark or mark all visible markers
        if (!confirm(`Are you sure you want to ${!found ? "un" : ""}mark all visible markers on the map?`)) return;

		// disable autosave to pack all changes in one save instead of multiple
        this.manager.storage.autosave = false; 

        const categories = this.manager.store.state.map.categories;
        for (var catId in categories) {
            const cat = categories[catId];
            if (cat.visible) {
                const locations = this.manager.store.state.map.locationsByCategory[catId] || [];
                locations.forEach(loc => this.manager.markLocation(loc.id, found));
            }
        }

        this.manager.storage.autosave = true;
    }
}