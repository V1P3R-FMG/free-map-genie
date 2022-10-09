import FMG_ListManager from "../list_manager";
import FMG_ListSearchBar from "./search_bar";

export default class FMG_ListUI {

    public readonly searchBar?: FMG_ListSearchBar;

    constructor(listManager: FMG_ListManager) {
        if (listManager.window.fmgSettings?.custom_search_bar) {
            this.searchBar = new FMG_ListSearchBar(listManager);
        }
    }
}