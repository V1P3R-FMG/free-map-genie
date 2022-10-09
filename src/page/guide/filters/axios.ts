import FMG_AxiosFilter, { RequestHandlers }  from "../../shared/filters/axios";
import FMG_GuideManager from "../guide_manager/index";

type Handler = (this: FMG_GuideAxiosFilter, key: string, id: number, data: any, url: string) => void;

const handleLocation: Handler = function(_, id) {
    const isMarked = this.manager.storage.data?.locations?.[id];
    this.manager.storage.markLocation(id, !isMarked);
}

const PutHandler: Dict<string, Handler> = {
    locations: handleLocation
}

const DeleteHandler: Dict<string, Handler> = {
    locations: handleLocation
}

export default class FMG_GuideAxiosFilter extends FMG_AxiosFilter {

    public readonly manager: FMG_GuideManager

    constructor(manager: FMG_GuideManager) {
        super(manager.window.axios, {
			put: PutHandler as RequestHandlers,
			post: {} as RequestHandlers,
			delete: DeleteHandler as RequestHandlers
		});

        this.manager = manager;
    }
}