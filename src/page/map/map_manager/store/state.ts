import FMG_Storage from "../storage";


export namespace FMG_State {
    export type Map = MG.State.Map & {
        categoriesByTitle: MG.DictById<MG.Category>,
    }
    
    export type User = MG.State.User;
    
    export type Routes = MG.State.Routes;
    
    export type Editor = MG.State.Editor;
    
    export type Search = MG.State.Search;
}

export default class FMG_State {

    private readonly storage: FMG_Storage
    private readonly categoriesByTitle: MG.DictById<MG.Category>;
    private readonly _getState: () => MG.State;
    
    constructor(window: MG.Map.Window, storage: FMG_Storage) {

        this.storage = storage;

        const categories =  window.store.getState().map.categories;

        this.categoriesByTitle = {};

        for (var catId in categories) {
            const cat = categories[catId];
            this.categoriesByTitle[cat.title] = cat;
        }

        this._getState = window.store.getState;
        window.store.getState = () => {
            const state = this._getState();
            state.user = this.user;
            return state;
        }
    }

    get map(): FMG_State.Map {
        const state = this._getState();
        const map = state.map as FMG_State.Map;

        map.categoriesByTitle = this.categoriesByTitle;

        return map;
    }

    get user(): FMG_State.User {
        const state = this._getState();
        const user = state.user as FMG_State.User;

        user.foundLocations = this.storage.data?.locations || {};

        return user;
    }

    get routes(): FMG_State.Routes {
        const state = this._getState();
        const routes = state.routes as FMG_State.Routes; 

        return routes;
    }

    get editor(): FMG_State.Editor {
        const state = this._getState();
        const editor = state.editor as FMG_State.Editor; 

        return editor;
    }

    get search(): FMG_State.Search  {
        const state = this._getState();
        const search = state.search as FMG_State.Search; 

        return search;
    }
}