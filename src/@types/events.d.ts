// Events that can be listened for by other scripts like the guide, map
interface WindowFmgEventsMap {
    "fmg-location": CustomEvent<{
        id: Id;
        marked: boolean;
    }>;
    "fmg-category": CustomEvent<{
        id: Id;
        tracked: boolean;
    }>;
    "fmg-note": CustomEvent<
        | {
              note: MG.Note;
              action: "added" | "updated";
          }
        | {
              action: "removed";
          }
    >;
    "fmg-preset": CustomEvent<
        | {
              preset: MG.Preset;
              action: "added";
          }
        | {
              action: "removed";
          }
        | {
              ordering: number[];
              action: "reordered";
          }
    >;
    "fmg-update": CustomEvent;
}

interface WindowEventMap extends WindowFmgEventsMap {}
