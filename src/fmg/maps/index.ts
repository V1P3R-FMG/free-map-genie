import { MapData } from "./map-data";

const MapsChached = Symbol("MapsChached");

export interface WindowExtended extends Window {
    [MapsChached]?: Maps;
}

export class Maps {
    private readonly window: WindowExtended;
    private readonly maps: MapData[] = [];

    [Symbol.iterator]: () => IterableIterator<MapData> = (() => {}) as any;

    constructor(window: WindowExtended) {
        if (window[MapsChached]) this.maps = window[MapsChached].maps;
        if (!window.mapData) throw new Error("window.mapData is not defined");
        this.window = window;
        this.maps = window.mapData.maps.map(
            (map) => new MapData(window, map.id)
        );
    }

    public async load() {
        await Promise.all(this.maps.map((map) => map.load()));
        this.window[MapsChached] = this;
    }

    public get isLoaded(): boolean {
        return this.maps.every((map) => map.isLoaded);
    }

    public get isLoading(): boolean {
        return this.maps.some((map) => map.isLoading);
    }

    public get(id: number): MapData {
        const map = this.maps.find((map) => map.mapId === id);
        if (!map) throw new Error(`Map with id ${id} not found`);
        return map;
    }

    public get all(): MapData[] {
        return this.maps;
    }
}

Maps.prototype[Symbol.iterator] = function () {
    return this["maps"][Symbol.iterator]();
};
