import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";
import { nanoid } from "nanoid";

interface UpdateNotePutData {
    color: string | null;
    description: string;
    latitude: number;
    longitude: number;
    map_id: number;
    title: string;
}

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    filter.registerFilter<MG.Note>(
        "post",
        "notes",
        false,
        (_method, _key, _id, data, _url, block) => {
            // Create a new note
            const note = {
                ...data,
                category: null,
                id: nanoid(10),
                user_id: mapManager.window.user?.id ?? -1
            };
            logger.debug("create note", note);

            // Add the note to the notes array
            mapManager.storage.data.notes.push(note);

            mapManager.fire("fmg-note", {
                note,
                action: "added"
            });
            block();
            return { data: note };
        }
    );

    filter.registerFilter<UpdateNotePutData>(
        "put",
        "notes",
        true,
        (_method, _key, id, data, _url, block) => {
            logger.debug("update note", id, data);
            const note = mapManager.storage.data.notes.find(
                (note) => note.id == id
            );

            // If the note doesn't exist, return
            if (!note) return;

            // Assign the new data to the note
            Object.assign(note, data);

            mapManager.fire("fmg-note", {
                note,
                action: "updated"
            });
            block();
            return { data: note };
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "notes",
        true,
        (_method, _key, id, _data, _url, block) => {
            logger.debug("delete note", id);

            // Filter out the note with the given id
            mapManager.storage.data.notes =
                mapManager.storage.data.notes.filter((note) => note.id != id);

            mapManager.fire("fmg-note", {
                action: "removed"
            });
            block();
        }
    );
}
