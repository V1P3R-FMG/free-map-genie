import { FMG_MapData } from "./map-data";

export class FMG_Maps {
    private static instance?: FMG_Maps;

    private data: Record<Id, FMG_MapData>;

    private constructor() {
        this.data = {};
    }

    public static get(window: Window): FMG_Maps {
        if (!FMG_Maps.instance) {
            FMG_Maps.instance = new FMG_Maps();
        }
        return FMG_Maps.instance;
    }

    public async all(): Promise<FMG_MapData[]> {
        if (!window.mapData) throw new Error("Map data not loaded");
        return await Promise.all(
            window.mapData.maps.map(
                async (map) => await FMG_MapData.get(map.id)
            )
        );
    }

    public async get(mapId: number): Promise<FMG_MapData> {
        if (!this.data[mapId]) {
            this.data[mapId] = await FMG_MapData.get(mapId);
        }
        return this.data[mapId];
    }
}
