interface Window {
    axios?: Lib.Axios;
    toastr?: Lib.Toastr;

    isEditor?: boolean;

    fmgMapManager?: import("@fmg/map-manager").FMG_MapManager;

    mapManager?: MG.MapManager;
    map?: MG.Map;
}
