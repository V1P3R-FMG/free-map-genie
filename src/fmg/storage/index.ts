import { checkDefined } from "@shared/utils";
import { Data } from "./data";
import { Settings } from "./settings";
import { EventEmitter, type EventCallback } from "@shared/event-emitter";
import type {
    MarkEventData,
    TrackEventData,
    UpdateEventData
} from "@fmg/events";

export class FMG_Storage extends EventEmitter {
    private readonly window: Window;

    private readonly gameId: number;
    private readonly userId: number;

    public data: Data;
    public settings: Settings;

    public constructor(window: Window) {
        super();

        this.window = window;

        this.gameId = checkDefined(window.game?.id, "window.game.id");
        this.userId = checkDefined(window.user?.id, "window.user.id");

        this.data = new Data({});
        this.settings = new Settings({});
    }

    public get key() {
        return `fmg:game_${this.gameId}:user_${this.userId}:v6`;
    }

    public on(name: "mark", cb: EventCallback<MarkEventData>): void;
    public on(name: "track", cb: EventCallback<TrackEventData>): void;
    public on(name: "updated", cb: EventCallback<UpdateEventData>): void;
    public on(name: string, cb: EventCallback<any>) {
        super.on(name, cb);
    }
}
