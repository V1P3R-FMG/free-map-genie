import { FMG_Storage } from "@fmg/storage";

export interface Map extends MG.State.Map {
    // categoriesByTitle: Record<string, MG.Category>
}

export interface User extends MG.State.User {}

export interface Routes extends MG.State.Routes {}

export interface Search extends MG.State.Search {}

export interface Editor extends MG.State.Editor {}

export interface FMG_State extends MG.State {
    user: User;
    map: Map;
    routes: Routes;
    search: Search;
    editor: Editor;
}

export function extendState(state: MG.State, storage: FMG_Storage): FMG_State {
    state.user.foundLocations = storage.data.locations;
    state.user.foundLocationsCount = storage.data.locationIds.length;
    state.user.trackedCategories = storage.data.categoryIds;
    state.user.totalFoundLocationsCount = storage.data.locationIds.length;

    if (storage.window.mapData) {
        state.user.presets = storage.data.presetOrder.map((id) => {
            if (id > -1) return storage.data.presets.find((p) => p.id == id)!;
            return storage.window.mapData!.presets.find((p) => p.id == id)!;
        });
    } else {
        logger.warn("mapData not found, could not set presets");
    }

    return state as FMG_State;
}
