import type { FMG_ApiFilter } from "@fmg/filters/api-filter";
import type { FMG_MapManager } from "@fmg/map-manager";

type PresetPostData = Omit<MG.Preset, "id"> & { ordering: number[] };
type ReorderPostData = { ordering: number[] };

export default function (filter: FMG_ApiFilter, mapManager: FMG_MapManager) {
    filter.registerFilter<PresetPostData>(
        "post",
        "presets",
        (_method, _key, _id, data, _url, block) => {
            const id = data.ordering.length - 1;

            // To prevet multiple saves, we disable autosave
            mapManager.storage.data.autosave = false;

            // Add the preset to the presets array
            mapManager.storage.data.presets.push({
                id,
                title: data.title,
                categories: data.categories,
                order: data.ordering.length
            });

            data.ordering.push(id);
            logger.debug("Adding preset", data);
            mapManager.storage.data.presetOrder = data.ordering;

            // Now we can save
            mapManager.storage.data.autosave = true;
            mapManager.storage.save();

            block();
            return { data };
        }
    );

    filter.registerFilter<PresetPostData>(
        "delete",
        "presets",
        (_method, _key, id, _data, _url, block) => {
            // To prevet multiple saves, we disable autosave
            mapManager.storage.data.autosave = false;

            // Remove the preset from the presets array
            mapManager.storage.data.presets.splice(parseInt(id), 1);

            // Update preset ids
            mapManager.storage.data.presets.forEach((preset, index) => {
                preset.id = index;
            });

            // Remove presetId from presetOrder
            // And shift all presetIds above it down by 1
            mapManager.storage.data.presetOrder =
                mapManager.storage.data.presetOrder
                    .map((presetId) => {
                        if (presetId > parseInt(id)) return presetId - 1;
                        else if (presetId == parseInt(id)) return undefined;
                        return presetId;
                    })
                    .filter((presetId) => presetId !== undefined) as number[];

            // Check if the only presetId in presetOrder is -1
            // If so then reset presetOrder to empty
            if (
                mapManager.storage.data.presetOrder.length == 1 &&
                mapManager.storage.data.presetOrder[0] == -1
            ) {
                mapManager.storage.data.presetOrder = [];
            }

            // Now we can save
            mapManager.storage.data.autosave = true;
            mapManager.storage.save();

            block();
            return;
        }
    );

    filter.registerFilter<ReorderPostData>(
        "post",
        "presets/reorder",
        (_method, _key, _id, data, _url, block) => {
            mapManager.storage.data.presetOrder = data.ordering;
            mapManager.store.updatePresets();
            block();
            return;
        }
    );
}
