interface Window {
    axios?: Lib.Axios;
    toastr?: Lib.Toastr;

    // Map globals
    isEditor?: boolean;
    isMini?: boolean;

    fmgMapManager?: import("@fmg/map-manager").FMG_MapManager;

    mapManager?: MG.MapManager;
    map?: MG.Map;

    // Guide globals
    mapElement?: HTMLIFrameElement;
}
