interface Window {
    user?: MG.User;
    game?: MG.Game;
    mapData?: MG.MapData;

    config?: MG.Config;
    mapData?: MG.MapData;

    mapUrl?: string;
    baseUrl?: string;
    cdnUrl?: string;
    tilesCdnUrl?: string;
    storageUrl?: string;

    initialZoom?: Int;
    initialPosition?: MG.Position;

    google?: MG.Google;

    store?: MG.Store;
    mapManager?: MG.MapManager;
    map?: MG.Map;
}
