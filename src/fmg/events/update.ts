import { EventData } from "@shared/event-emitter";

export interface UpdateEventData {}

export class UpdateEvent extends EventData<UpdateEventData> {
    constructor() {
        super("update");
    }
}
