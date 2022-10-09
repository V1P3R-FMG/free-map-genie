import EventEmitter, { DataEvent, EventCallback } from "../../../shared/event_emitter";

export type RequestHandler = (this: FMG_AxiosFilter, key: string, id: number, data: any, str: string) => void;
    
export type RequestHandlers = Dict<string, RequestHandler>

export type AxiosHandlers = {
	put: RequestHandlers,
	post: RequestHandlers,
	delete: RequestHandlers,
}

export class PutBlockEvent extends DataEvent {
	constructor(key: string, id: number) { super("put", { key, id }); }
}

export class PostBlockEvent extends DataEvent {
	constructor(key: string, id: number) { super("post", { key, id }); }
}

export class DeleteBlockEvent extends DataEvent {
	constructor(key: string, id: number) { super("delete", { key, id }); }
}

export class BlockEvent extends DataEvent {
	constructor() { super("block"); }
}

function createBlockEvent(name: "put"|"post"|"delete", key: string, id: number) {
	switch(name) {
		case "put":
			return new PutBlockEvent(key, id);
		case "post":
			return new PostBlockEvent(key, id);
		case "delete":
			return new DeleteBlockEvent(key, id);
	}
}

const Filtred: unique symbol = Symbol("Filtred");

export default class FMG_AxiosFilter extends EventEmitter {

    protected readonly axios: Lib.Axios;

    constructor(axios: Lib.Axios, handlers: AxiosHandlers) {
        super();

        this.axios = axios;
        if ((axios as any)[Filtred]) throw new Error("Axios is allready filtered!");

        this._createFilter("put", handlers.put);
        this._createFilter("post", handlers.post);
        this._createFilter("delete", handlers.delete);
    }

    protected _createFilter(name: string, requestHandlers: Dict<string, RequestHandler>) {
        const f = this.axios[name as keyof Lib.Axios];

        this.axios[name as keyof AxiosHandlers] = (...args: any[]) => {
            return Promise.resolve().then(() => {
                const [url, data] = args;
                const key = url.match(/\/api\/v1\/user\/((\/?[A-Za-z]+)+)\/?/)?.[1];
				const handler = key && requestHandlers[key.replace("/", "_")];
                if (handler) {
					let id = parseInt(url.match(/(\d+)$/)?.[1] || -1);
					const result = handler.call(this, key, id, data, url);
					
					this.emit(createBlockEvent(name as keyof AxiosHandlers, key, id));
					this.emit(new BlockEvent());

					return result;
				}
                return f.apply(this.axios, args as any);
            })
        }
    }

	on(name: "put", f: EventCallback<PutBlockEvent>): void;
	on(name: "post", f: EventCallback<PostBlockEvent>): void;
	on(name: "delete", f: EventCallback<DeleteBlockEvent>): void;
	on(name: "block", f: EventCallback<BlockEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f) };
}