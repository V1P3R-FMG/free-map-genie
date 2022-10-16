import FMG_MapManager from "../map_manager";
import FMG_CategoryTracker from "./category_tracker";
import FMG_MarkControls from "./mark_controls";
import FMG_PopupObserver from "./popup";
import FMG_ToggleFound from "./toggle_found";
import FMG_TotalProgress from "./total_progress";

export interface FMG_UIBase {
    update(): void,
}

export class FMG_UI implements FMG_UIBase {

    toggleFound: FMG_ToggleFound;
    categoryTracker: FMG_CategoryTracker;
    totalProgress: FMG_TotalProgress;
    markControls: FMG_MarkControls;
	popupObserver: FMG_PopupObserver;

    constructor(manager: FMG_MapManager) {

        this.toggleFound = new FMG_ToggleFound(manager);
        this.totalProgress = new FMG_TotalProgress(manager);
		
        this.markControls = new FMG_MarkControls(manager);
		
        this.categoryTracker = new FMG_CategoryTracker(manager);
		this.popupObserver = new FMG_PopupObserver(manager);
    }

    update() {
        this.toggleFound.update();
        this.totalProgress.update();

        this.categoryTracker.update();
		this.popupObserver.update();
    }
}

export class FMG_MINI_UI implements FMG_UIBase {
    constructor(manager: FMG_MapManager) {

    }

    update() {

    }
}