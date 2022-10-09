import FMG_StorageObject from "../../shared/storage_object";

export default class FMG_GuideStorage extends FMG_StorageObject {
	constructor() {
		super();
	}

	markLocation(id: MG.Id, mark: boolean) {
		const locations = this.data.locations || {};
		if (mark) {
			locations[id] = true;
		} else {
			delete locations[id];
		}
	}
}