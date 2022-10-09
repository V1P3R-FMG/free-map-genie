import FMG_MapManager from "../map_manager";

export default class FMG_TotalProgress {

    private readonly $element: JQuery<HTMLElement>;

    private readonly $item: JQuery<HTMLElement>;

    private readonly $icon: JQuery<HTMLElement>;
    private readonly $counter: JQuery<HTMLElement>;
    private readonly $progressBar: JQuery<HTMLElement>;

    private readonly _manager: FMG_MapManager;

    constructor(manager: FMG_MapManager) {

        this._manager = manager;

        this.$element = $(`<div class="progress-item-wrapper">
            <div class="progress-item" id="total-progress" style="margin-right: 5%;">
                <span class="icon">0.00%</span>
                <span class="title"></span>
                <span class="counter">0/0</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" role="progressbar" style="width: 0%;"></div>
                </div>
            </div>
        </div>
        <hr>`);

        this.$item = this.$element.find(".progress-item");
        
        this.$icon = this.$element.find(".icon");
        this.$counter = this.$element.find(".counter");
        this.$progressBar = this.$element.find(".progress-bar");

        this.$element.insertBefore($(manager.window.document).find("#user-panel > div:first-of-type .category-progress"));
    }

    calculateTotal() {
        var count = 0;
        
        const data = this._manager.storage.data;
        const state = this._manager.store.state;

        for (var catId in data?.categories || {}) {
            const locations = state.map.locationsByCategory[catId] || [];
            count += locations.length;
        }

        return count;
    }

    calculateTotalLegacy() {
        var count = 0;

        const state = this._manager.store.state;
        state.map.categoryIds.forEach(catId => {
            const locations = state.map.locationsByCategory[catId] || [];
            count += locations.length;
        });

        return count;
    }

    calculateProgress() {
        var count = 0;

        const data = this._manager.storage.data;
        const categories = data?.categories || {};

        const locationsById = this._manager.store.state.map.locationsById;

        for (var locId in data?.locations || {}) {
            const loc = locationsById[locId];
            if (loc && categories[loc.category_id]) {
                count += 1;
            }
        }

        return count;
    }

    calculateProgressLegacy() {
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
        const legacy = this._manager.settings?.total_progress_bar_legacy_mode || false;
        const count =  legacy ? this.calculateProgressLegacy() : this.calculateProgress();
        const total = legacy ? this.calculateTotalLegacy() : this.calculateTotal();

        let percent = total == 0 ? 100 : count / total * 100;
        this.$icon.text(`${percent.toFixed(2)}%`);
        this.$counter.text(`${count} / ${total}`);
        this.$progressBar.css("width", `${percent}%`);
    }
}