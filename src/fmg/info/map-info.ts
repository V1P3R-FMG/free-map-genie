export class FMG_MapInfo {
    private static instance?: FMG_MapInfo;

    public mapId: number;
    public mapName: string;

    private constructor(window: Window) {
        this.mapId = 0;
        this.mapName = "";

        if (!this.loadMapInfoFomUrlParams(window)) {
            this.loadMapInfoFromMapData(window);
        }
    }

    private loadMapInfoFomUrlParams(window: Window) {
        const params = new URL(window.location.href).searchParams;
        const map = params.get("map");
        const mapId = map
            ? window.mapData?.maps.find((m) => m.slug == map)?.id ?? null
            : null;

        if (map && !mapId) {
            console.error(
                "Map({}) not found, valid maps: ",
                window.mapData?.maps.map((map) => map.slug) || []
            );
            return false;
        }

        this.mapId = mapId ?? 0;
        this.mapName = map ?? "";

        return true;
    }

    private loadMapInfoFromMapData(window: Window): boolean {
        this.mapId = window.mapData?.map?.id ?? 0;
        this.mapName = window.mapData?.map?.slug ?? "";

        if (!this.mapId || !this.mapName) {
            console.error("MapData not found!");
            return false;
        }

        return true;
    }

    public static get(window: Window): FMG_MapInfo {
        if (!FMG_MapInfo.instance) {
            FMG_MapInfo.instance = new FMG_MapInfo(window);
        }
        return FMG_MapInfo.instance;
    }
}
