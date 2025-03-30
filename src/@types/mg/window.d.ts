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
    initialPosition?: {
        lat: number;
        lng: number;
    };

    fmgMapgenieAccountData?: {
        locationIds: number[];
        categoryIds: number[];
    };

    google?: {
        maps?: {
            Size: (x: number, y: number) => void;
        };
    };
}
