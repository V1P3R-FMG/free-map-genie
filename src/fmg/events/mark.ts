import { EventData, type EventCallback } from "@shared/event-emitter";

export interface MarkEventData {
    id: Id;
    marked: boolean;
}

export class MarkEvent extends EventData<MarkEventData> {
    constructor(id: Id, marked: boolean) {
        super("mark", { id, marked });
    }
}

export interface MarkEventEmitter {
    on(name: "mark", cb: EventCallback<MarkEventData>): void;
}
