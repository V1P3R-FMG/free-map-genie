export class MapData {
    public readonly mapId: number;
    public readonly url: string;
    private readonly window: Window;

    private mapData: MG.Info.MapData | null = null;
    private loaded: boolean = false;
    private loading: boolean = false;

    constructor(window: Window, mapId: number) {
        this.mapId = mapId;

        const map = window.mapData?.maps.find((map) => map.id === mapId);
        if (!map) throw new Error(`Map with id ${mapId} not found`);

        this.window = window;
        this.url = MapData.getMapUrl(window, map);
    }

    private static getMapUrl(window: Window, map: MG.Info.Map) {
        if (!window.game) throw new Error("window.game is not defined");
        return `${window.location.origin}/${window.game.slug}/maps/${map.slug}`;
    }

    private CheckIfReady() {
        if (!this.loaded) throw new Error("Map is not loaded");
        if (!this.mapData) throw new Error("Map data is not loaded");
    }

    public async load() {
        if (this.loaded) return;
        if (this.loading) throw new Error("Map is already loading");
        return new Promise<void>((resolve, reject) => {
            this.loading = true;

            const frame = this.window.document.createElement("iframe");
            this.window.document.body.append(frame);

            frame.src = this.url;
            frame.loading = "eager";
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
        this.CheckIfReady();
        return this.mapData!;
    }

    public filterLocations(locations: Id[]): Id[] {
        this.CheckIfReady();
        return locations.filter((id) => {
            return !!this.mapData!.locations.some((loc) => loc.id == id);
        });
    }

    public filterCategories(categories: Id[]): Id[] {
        this.CheckIfReady();
        return categories.filter((id) => {
            return !!this.mapData!.categories[id];
        });
    }

    public filterPresets(
        presets: MG.Preset[],
        presetOrder: MG.PresetOrder
    ): [MG.Preset[], MG.PresetOrder] {
        this.CheckIfReady();
        const filteredPresets = presets.filter((preset) => {
            return !!this.filterCategories(preset.categories).length;
        });
        const filteredPresetOrder = presetOrder.filter((id) => {
            return !!filteredPresets.find((preset) => preset.id === id);
        });
        return [presets, filteredPresetOrder];
    }
}
