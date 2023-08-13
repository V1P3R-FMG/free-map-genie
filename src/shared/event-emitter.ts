export class EventData<T = object> {
    public name: string;
    public data: T;

    constructor(name: string, data?: T) {
        this.name = name;
        if (data != undefined) {
            this.data = data;
        } else {
            this.data = {} as any;
        }
    }
}

export interface EventCallback<T = object> {
    (e: EventData<T>): void;
}

class EventGroup {
    private listeners: EventCallback<any>[];

    public get length() {
        return this.listeners.length;
    }

    constructor() {
        this.listeners = [];
    }

    public emit<T>(event: EventData<T>) {
        this.listeners.forEach((listener) => {
            listener(event);
        });
    }

    public on<T>(callback: EventCallback<T>) {
        this.listeners.push(callback);
    }

    public off<T>(callback: EventCallback<T>) {
        this.listeners = this.listeners.filter(
            (listener) => listener != callback
        );
    }
}

export class EventEmitter {
    private eventGroups: Record<string, EventGroup>;
    private muted: boolean;

    public constructor() {
        this.eventGroups = {};
        this.muted = false;
    }

    public emit<T>(event: EventData<T>) {
        if (!this.muted) {
            this.eventGroups[event.name]?.emit(event);
        }
    }

    public on<T = any>(name: string, callback: EventCallback<T>) {
        if (!this.eventGroups[name]) {
            this.eventGroups[name] = new EventGroup();
        }
        this.eventGroups[name].on(callback);
    }

    public off<T = any>(name: string, callback: EventCallback<T>) {
        if (!this.eventGroups[name]) return;
        this.eventGroups[name].off(callback);
        if (!this.eventGroups.length) {
            delete this.eventGroups[name];
        }
    }

    public mute() {
        this.muted = true;
    }

    public unmute() {
        this.muted = false;
    }
}
