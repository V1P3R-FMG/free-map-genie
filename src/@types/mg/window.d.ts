interface Window {
    store?: MG.Store;

    map?: MG.Map;
    game?: MG.Info.Game;
    user?: MG.Info.User;

    config?: MG.Config;
    mapData?: MG.Info.MapData;

    mapUrl?: string;
    baseUrl?: string;
    cdnUrl?: string;
    tilesCdnUrl?: string;
    storageCdnUrl?: string;

    initialZoom?: number;
    initiaPosition?: {
        lat: number;
        lng: number;
    };

    google?: {
        maps?: {
            Size: (x: number, y: number) => void;
        };
    };
}
