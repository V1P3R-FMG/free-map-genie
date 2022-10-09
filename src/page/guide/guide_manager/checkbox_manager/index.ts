import FMG_GuideManager from "../index";

export class FMG_Checkbox {

    public readonly $checkbox: JQuery<HTMLInputElement>;
    public readonly mapId: number;
    public readonly locationsId: number;
    public readonly categoryId: number;
    public readonly regionId: number;
    private _onCheckChanged: (this: FMG_Checkbox, checked: boolean) => void = () => {};

    constructor(checkbox: HTMLInputElement) {
        this.$checkbox = $(checkbox);
        this.mapId = this.$checkbox.data("map-id");
        this.locationsId = this.$checkbox.data("location-id");
        this.categoryId = this.$checkbox.data("category-id");
        this.regionId = this.$checkbox.data("region-id");
    }

    get checked() {
        return this.$checkbox.is(":checked");
    }

    set checked(b: boolean) {
        if (this.checked != b) {
            this.$checkbox.prop("checked", b);
            this._onCheckChanged(b);
        }
    }

    set onCheckChanged(f: (checked: boolean) => void) {
        this._onCheckChanged = f.bind(this);
    }

    mark(found: boolean) {
        this.checked = found;
    }
}

export default class FMG_CheckboxManager {

    // private readonly _manager: FMG_GuideManager;

    private readonly _checkboxesByLocationId: MG.DictById<FMG_Checkbox>;
    private readonly _checkboxesByCategories: MG.DictById<Array<FMG_Checkbox>>;

    constructor(manager: FMG_GuideManager) {

        this._checkboxesByLocationId = {};
        this._checkboxesByCategories = {};

        $(manager.document).find("input[type='checkbox']").each((_, checkbox) => {
            const fmgCheckbox = new FMG_Checkbox(checkbox as HTMLInputElement);
            this._checkboxesByLocationId[fmgCheckbox.locationsId] = fmgCheckbox;

            fmgCheckbox.onCheckChanged = function(checked) {
                manager.window.markLocationFound?.({
                    target: checkbox as HTMLInputElement
                }, this.locationsId, checked);
            }
            
            var byCategories = this._checkboxesByCategories[fmgCheckbox.categoryId];
            if (!byCategories) {
                byCategories = [];
                this._checkboxesByCategories[fmgCheckbox.categoryId] = byCategories;
            }
            byCategories.push(fmgCheckbox);
        });
    }

    markLocation(id: MG.Id, found: boolean) {
        const fmgCheckbox = this._checkboxesByLocationId[id];
        fmgCheckbox?.mark(found);
    }

    clear() {
        for (let id in this._checkboxesByLocationId) {
            const fmgCheckbox = this._checkboxesByLocationId[id];
            fmgCheckbox?.mark(false);
        }
    }
}