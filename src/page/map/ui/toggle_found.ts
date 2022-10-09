import FMG_MapManager from "../map_manager";

export default class FMG_ToggleFound {

    private readonly $element: JQuery<HTMLSpanElement>
    private readonly _manager: FMG_MapManager;

    constructor(manager: FMG_MapManager) {

        const $toggleFound = $(manager.window.document).find("#toggle-found").hide();

        this.$element = $toggleFound.clone()
            .insertAfter($toggleFound)
            .show()
            .on("click", () => {
                $toggleFound.trigger("click");
                this.$element.toggleClass("disabled", $toggleFound.hasClass("disabled"));
            });

        this._manager = manager;
    }
    
    calculateFoundLocations() {
        var count = 0;
        const data = this._manager.storage.data;
        const locationsById = this._manager.store.state.map.locationsById; 

        for (var id in data?.locations || {}) {
            if (locationsById[id]) {
                count++;
            }
        }
        
        return count;
    }

    update() {
        this.$element.html(`
            <i class="icon ui-icon-show-hide"></i>
            Found Locations(${this.calculateFoundLocations()})
        `);
    }
}