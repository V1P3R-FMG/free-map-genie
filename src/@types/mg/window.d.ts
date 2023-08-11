interface Window {
    store?: MG.Store;
    map?: MG.Map;
    game?: MG.Game;
    user?: MG.User;
    config?: MG.Config;

    google?: {
        maps?: {
            Size: (x: number, y: number) => void;
        };
    };
}
