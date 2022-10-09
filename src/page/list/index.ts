import FMG_ListManager from "./list_manager";
import FMG_ListUI from "./ui/index";

export default class FMG_List {

	public readonly listManager: FMG_ListManager;
    public readonly ui: FMG_ListUI;

    constructor(window: MG.List.Window) {
		this.listManager = new FMG_ListManager(window);
        this.ui = new FMG_ListUI(this.listManager);
    }
}