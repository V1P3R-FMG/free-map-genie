interface Window {
    axios?: Lib.Axios;
    toastr?: Lib.Toastr;

    isEditor?: boolean;

    fmgMapManager?: import("@/content/map/map-manager").FMG_MapManager;

    mapManager?: MG.MapManager;
    map?: MG.Map;
}
