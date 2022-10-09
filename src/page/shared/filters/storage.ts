import EventEmitter, { DataEvent, EventCallback } from "../../../shared/event_emitter";

export type Handler = (this: FMG_StorageFilter, name: string, key: string, value: any) => boolean;

export type Handlers = Dict<string, Handler>

export type StorageHandlers = {
	set: Handlers,
	remove: Handlers,
}

class SetBlockEvent extends DataEvent {
	constructor(key: string, value?: any) { super("set", { key, value }) }
}

class RemoveBlockEvent extends DataEvent {
	constructor(key: string, value?: any) { super("remove", { key, value }) }
}

function createBlockEvent(name: "setItem" | "removeItem", key: string, value?: any) {
    switch(name) {
		case "setItem":
			return new SetBlockEvent(key, value);
		case "removeItem":
			return new RemoveBlockEvent(key, value);
	}
}

export default class FMG_StorageFilter extends EventEmitter {

    protected readonly local: Storage;

    constructor(local: Storage, handlers: StorageHandlers) {
        super();

        this.local = local;

        this._createFilter("setItem", handlers.set);
        this._createFilter("removeItem", handlers.remove);
    }

    private _createFilter(name: "setItem" | "removeItem", handlers: Handlers) {
        const f = Object.getPrototypeOf(this.local)[name as keyof Storage];

        const filter = this;

        Object.getPrototypeOf(this.local)[name] = function(key: string, value: any) {

			// only execute this function if this object is our LocalStorage object
			if (this === filter.local) {
				for (const handlerName in handlers) {
					if (key.match(handlerName)) {
						
						const handler = handlers[handlerName];
	
						const cancel = handler.call(filter, name, key, value);
	
						filter.emit(createBlockEvent(name, key, value));
	
						if (cancel) return value;
						break;
					}
				}
			}
            return f.call(this, key, value);
        }
    }

	on(name: "set", f: EventCallback<SetBlockEvent>): void;
	on(name: "remove", f: EventCallback<RemoveBlockEvent>): void;
	on(name: string, f: EventCallback): void { super.on(name, f) };
}