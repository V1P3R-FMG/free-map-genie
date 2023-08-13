import { EventData } from "@shared/event-emitter";

export class TrackEvent extends EventData<TrackEventData> {
    constructor(id: Id, tracked: boolean) {
        super("track", { id, tracked });
    }
}

export interface TrackEventData {
    id: Id;
    tracked: boolean;
}
