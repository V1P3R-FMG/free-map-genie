interface Window {
    store?: MG.Store;
    map?: MG.Map;
    game?: MG.Info.Game;
    user?: MG.Info.User;
    config?: MG.Config;
    mapData?: MG.Info.MapData;

    google?: {
        maps?: {
            Size: (x: number, y: number) => void;
        };
    };
}
