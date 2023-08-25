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
            const note = {
                ...data,
                category: null,
                id: nanoid(10),
                user_id: mapManager.window.user?.id ?? -1
            };
            logger.debug("create note", note);
            mapManager.storage.data.notes.push(note);
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
            mapManager.storage.data.notes = mapManager.storage.data.notes.map(
                (note) => {
                    if (note.id == id) {
                        return {
                            ...note,
                            ...data
                        };
                    }
                    return note;
                }
            );
            block();
        }
    );

    filter.registerFilter<undefined>(
        "delete",
        "notes",
        true,
        (_method, _key, id, _data, _url, block) => {
            logger.debug("delete note", id);
            mapManager.storage.data.notes =
                mapManager.storage.data.notes.filter((note) => note.id != id);
            block();
        }
    );
}
