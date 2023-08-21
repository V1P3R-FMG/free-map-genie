interface Window {
    axios?: Lib.Axios;
    toastr?: Lib.Toastr;

    fmgMap?: import("@/content/map/index").FMG_Map;
    fmgInfo?: {
        //games: MG.Game[];
        maps?: import("@fmg/info/maps").FMG_Maps;
        mapData: {
            get: (typeof import("@fmg/info/map-data").FMG_MapData)["get"];
        };
    };

    mapManager?: {
        setLocationFound(locationId: Id, found: boolean): void;
    };
}
