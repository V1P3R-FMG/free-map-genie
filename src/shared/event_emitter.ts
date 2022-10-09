export class DataEvent<T extends object=any> extends Event {

	public readonly data;

	constructor(name: string, data?: T) {
		super(name);
		this.data = data;
	}
}

export type EventCallback<T extends DataEvent=DataEvent> = (e: T) => void;

export default class EventEmitter {

    private _blockCount: number = 0;
    protected et: EventTarget;

    constructor() {
        this.et = new EventTarget();
    }

    protected emit(e: DataEvent) {
        if (!this.isBlocked) this.et.dispatchEvent(e);
    }

    get isBlocked() {
        return this._blockCount > 0;
    }

    blockAll() {
        this._blockCount++;
    }

    unBlockAll() {
        this._blockCount = Math.max(this._blockCount - 1, 0);
    }

    on(name: string, f: EventCallback): void {
        this.et.addEventListener(name, f as any);
    }

    off(name: string, f: EventCallback): void {
        this.et.removeEventListener(name, f as any);
    }
}