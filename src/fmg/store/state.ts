import { FMG_Storage } from "@fmg/storage/index";

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
    state.user.foundLocations = storage.data?.locations || {};
    return state as FMG_State;
}
