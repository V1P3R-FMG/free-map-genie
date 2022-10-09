import FMG_MapManager from "../map_manager";

function getCategoryNameFromItemWrapper(categoryItemWrapper: HTMLElement) {
    return $(categoryItemWrapper).find(".title").text();
}

function isItemWrapper(element: HTMLElement) {
    return element.classList.contains("progress-item-wrapper") && !element.classList.contains("clone");
}

export class FMG_CategoryItem {

    private readonly $original: JQuery<HTMLElement>;
    private readonly $element: JQuery<HTMLElement>;
    private readonly $counter: JQuery<HTMLElement>;
    private readonly $progressBar: JQuery<HTMLElement>;

    public readonly catId: MG.Id;
    public readonly total: number;

    constructor(element: HTMLElement, categoryId: MG.Id, total: number) {
        this.$original = $(element).hide();

        this.$element = this.$original.clone().addClass("clone").insertAfter(this.$original).show();
        this.$counter = this.$element.find(".counter");
        this.$progressBar = this.$element.find(".progress-bar");

        const $originalRemoveElement = this.$original.find(".progress-item-remove");
        this.$element.find(".progress-item-remove").on("click", () => {
            $originalRemoveElement.trigger("click");
        });

        const $originalItemElement = this.$original.find(".progress-item");
        this.$element.find(".progress-item").on("click", () => {
            $originalItemElement.trigger("click");
        });

        this.catId = categoryId;
        this.total = total;
    }

    update(count: number) {
        this.$counter.text(`${count}/${this.total}`);
        this.$progressBar.css("width", `${count / this.total * 100}%`)
    }

    remove() {
        this.$element.remove();
    }
}

export default class FMG_CategoryTracker {

    private readonly _manager: FMG_MapManager;
    private readonly _categories: MG.DictById<FMG_CategoryItem>;
    private readonly _categoriesByTitle: Dict<string, MG.Category>;
    private readonly _locationsByCategrories: MG.DictById<Array<MG.Location>>;
    private readonly _observer: MutationObserver;

    private readonly $categoryProgress: JQuery<HTMLElement>;

    constructor(manager: FMG_MapManager) {
        this._manager = manager;
        this._categories = {}

        this._categoriesByTitle = manager.store.state.map.categoriesByTitle;
        this._locationsByCategrories = manager.store.state.map.locationsByCategory;

        this.$categoryProgress = $(manager.document).find(".category-progress");

        this.$categoryProgress.find(".progress-item-wrapper").each((_, element) => this._add(element));

        this._observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (isItemWrapper(node as HTMLElement)) this._add(node as HTMLElement);
                });

                mutation.removedNodes.forEach(node => {
                    if (isItemWrapper(node as HTMLElement)) this._remove(node as HTMLElement);
                });
            });
        });

        const categoryProgress = this.$categoryProgress.get(0);
        if (categoryProgress) {
            this._observer.observe(categoryProgress, {
                childList: true
            });
        } else {
            console.warn("No category progress element!");
        }

    }

    private _add(categoryItemWrapper: HTMLElement) {
        const title = getCategoryNameFromItemWrapper(categoryItemWrapper);
        const cat = this._categoriesByTitle[title];
        const total = this._locationsByCategrories[cat.id].length || 0;

        const catItem = new FMG_CategoryItem(categoryItemWrapper, cat?.id || -1, total);

        this._categories[cat.id] = catItem;
        catItem.update(this.calculateCategoryProgress(cat.id));
    }

    private _remove(categoryItemWrapper: HTMLElement) {
        const title = getCategoryNameFromItemWrapper(categoryItemWrapper);
        const cat = this._categoriesByTitle[title];
        const catItem = this._categories[cat.id];

        catItem?.remove();

        delete this._categories[cat.id];
    }

    calculateCategoryProgress(catId: MG.Id) {
        var count = 0

        const state = this._manager.store.state;
        const locations = state.map.locationsByCategory[catId] || [];
        const data = this._manager.storage.data;

        locations.forEach(loc => {
            if (data?.locations?.[loc.id]) {
                count += 1;
            }
        });

        return count;
    }

    update() {
        for (var catId in this._categories) {
            const catItem = this._categories[catId];
            catItem?.update(this.calculateCategoryProgress(catId));
        } 
    }
}