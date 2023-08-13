export class MapData {
    public readonly mapId: number;
    public readonly url: string;
    private mapData: MG.Info.MapData | null = null;
    private loaded: boolean = false;
    private loading: boolean = false;

    constructor(window: Window, mapId: number) {
        this.mapId = mapId;

        const map = window.mapData?.maps.find((map) => map.id === mapId);
        if (!map) throw new Error(`Map with id ${mapId} not found`);

        this.url = MapData.getMapUrl(window, map);
    }

    private static getMapUrl(window: Window, map: MG.Info.Map) {
        if (!window.game) throw new Error("window.game is not defined");
        return `${location.origin}/${window.game.slug}/maps/${map.slug}`;
    }

    public async load() {
        if (this.loaded) return;
        if (this.loading) throw new Error("Map is already loading");
        return new Promise<void>((resolve, reject) => {
            this.loading = true;

            const frame = document.createElement("iframe");
            document.body.append(frame);

            frame.src = this.url;
            frame.style.display = "none";

            frame.addEventListener("load", () => {
                this.mapData = frame.contentWindow?.mapData ?? null;
                this.loaded = true;
                frame.remove();
                resolve();
            });

            frame.addEventListener("error", () => {
                reject(new Error("Failed to load map"));
            });

            this.loading = false;
        });
    }

    public get isLoaded(): boolean {
        return this.loaded;
    }

    public get isLoading(): boolean {
        return this.loading;
    }

    public get data(): MG.Info.MapData {
        if (!this.loaded) throw new Error("Map is not loaded");
        if (!this.mapData) throw new Error("Map data is not loaded");
        return this.mapData;
    }
}
