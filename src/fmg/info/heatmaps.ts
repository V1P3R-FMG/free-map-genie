import channel from "@shared/channel/content";
import FMG_MapData from "./map";

function parseGroup(heatmaps: MG.API.HeatmapGroup): MG.HeatmapGroup {
    return {
        id: heatmaps.id,
        game_id: heatmaps.game_id,
        title: heatmaps.title,
        order: heatmaps.order,
        color: heatmaps.color,
        expandable: heatmaps.expandable,
        heatmap_categories: heatmaps.categories
    }
}

export default class FMG_HeatmapsData {
    private static cache: Record<Id, FMG_HeatmapsData> = {};

    public readonly groups: MG.HeatmapGroup[];
    public readonly categories: DictById<MG.HeatmapCategory>;

    private constructor(heatmaps: MG.API.Heatmaps) {
        this.groups = heatmaps.map(parseGroup);
        this.categories = Object.fromEntries(
            heatmaps.map((group) => group.categories)
                .flat()
                .map((category) => [category.id, category])
        );
    }

    public static async get(mapId: Id) {
        return (this.cache[mapId] ??= await this.fetch(mapId));
    }

    private static async fetch(mapId: Id) {
        const data = await channel.background.heatmaps({ mapId });
        return new FMG_HeatmapsData(data);
    }
}
