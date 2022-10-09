import FMG_StorageObject from "../../shared/storage_object";
import toggle from "../../shared/key_toggle";

// function toggle(object: Dict<any, boolean>, key: any, enable?: boolean) {
//     enable = typeof enable === "undefined" ? object[key] : enable;
//     if (enable) object[key] = true;
//     else delete object[key];
// }

export default class FMG_MapStorage extends FMG_StorageObject {

    // private readonly window: MG.Map.Window;
    private readonly hasDemoPreset: boolean;

    constructor(window: MG.Map.Window) {
		super();
		this.load(window);

        // this.window = window;

        const demoPreset = window.mapData.presets[0];
        this.hasDemoPreset = demoPreset && demoPreset.id == -1 || false;
    }

    markLocation(id: MG.Id, found: boolean) {
        toggle(this.data.locations || {}, id as string, found);
    }

    trackCategory(id: MG.Id, track: boolean) {
        toggle(this.data.categories || {}, id as string, track);
    }

    addPreset(preset: MG.Preset) {

        const presets = this.data.presets || {};
        const presetsOrder = this.data.presets_order || [];

        if (presetsOrder.length == 0 && this.hasDemoPreset) presetsOrder.push(-1);

        presets[preset.id] = preset;

        presetsOrder.push(preset.id);

        for (var id in presets) {
            const preset = presets[id];
            preset.order = presetsOrder.indexOf(parseInt(id));
        }
    }

    deletePreset(presetId: MG.Id) {

        const presets = this.data.presets || {};
        const presetsOrder = this.data.presets_order || [];

        let index = presetsOrder.indexOf(parseInt(presetId as string));
        if (index !== -1) presetsOrder.splice(index, 1);

        if (presetsOrder.length == 1 && presetsOrder[0] == -1) presetsOrder.length = 0;

        delete presets[presetId];

        for (var id in presets) {
            const preset = presets[id];
            preset.order = presetsOrder.indexOf(parseInt(id));
        }
    }

    reorderPresets(ordering: MG.PresetOrder) {

        const presets = this.data.presets || {};

        if (this.data) this.data.presets_order = Object.assign([], ordering);

        for (var id in presets) {
            const preset = presets[id];
            preset.order = ordering.indexOf(parseInt(id));
        }
    }
}