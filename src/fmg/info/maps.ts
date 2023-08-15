import { FMG_MapData } from "./map-data";

export class FMG_Maps {
    private static instance?: FMG_Maps;

    private data?: Record<Id, FMG_MapData>;

    private constructor() {
        this.data = {};
    }

    public static async get(window: Window): Promise<FMG_Maps> {
        if (!FMG_Maps.instance) {
            FMG_Maps.instance = new FMG_Maps();
            await FMG_Maps.instance.load(window);
        }
        return FMG_Maps.instance;
    }

    public async load(window: Window): Promise<void> {
        if (!window.mapData) throw new Error("Map data not loaded");

        const maps = await Promise.all(
            window.mapData.maps.map(async (map) => [
                map.id,
                await FMG_MapData.get(map.id)
            ])
        );

        this.data = Object.fromEntries(maps);
    }

    public all(): FMG_MapData[] {
        return Object.values(this.data!);
    }

    public get(mapId: Id) {
        return this.data![mapId];
    }
}
