import siteType from "./site";

import listStyle from "./css/list.css";
import mapStyle from "./css/map.css";

import FMG_Map from "./map/index";
import FMG_Guide from "./guide/index";
import FMG_List from "./list/index";
import appendStyle from "../shared/appendStyle";
import { waitForDomLoaded, waitForGlobalsLoaded } from "../shared/load_utils";

interface ExtensionWindow extends Window {
	fmgMap?: FMG_Map;
	fmgGuide?: FMG_Guide;
	fmgList?: FMG_List;
}

declare var window: Spread<[ExtensionWindow, MG.Window]>;

function reloadListeners(reloadCb: CallableFunction) {
    document.addEventListener("visibilitychange", () => {
        switch (document.visibilityState) {
            case "visible":
                reloadCb();
                break
        }
    });

    window.addEventListener("message", (e) => {
        switch (e.data.type) {
            case "reload":
            case "fmg:update":
                reloadCb();
                break
        } 
    });
}

(async function () {

	const session = window.sessionStorage;
	const settings = JSON.parse(session.getItem("fmg:extension:settings") || "{}");
	const debug = JSON.parse(session.getItem("fmg:debug_mode") || "false");

	window.fmgSettings = settings;
	window.fmgDebug = debug;

	const config = (window as MG.Map.Window).config || {};
	config.presetsEnabled = config.presetsEnabled || settings?.presets_allways_enabled || false;

    switch(await siteType()) {

        case "map":

			appendStyle(mapStyle);

			// only if user is loggedin
            if (!!(window as MG.Map.Window).user) {
                await waitForGlobalsLoaded(["store"]);

                const map = new FMG_Map(window as MG.Map.Window);
                map.init();

                reloadListeners(() => map.reload());

                window.fmgMap = window.fmgDebug ? undefined : map;
            }
            break
    
        case "guide":
			
			await waitForGlobalsLoaded(["foundLocations"]);

			const guide = new FMG_Guide(window as MG.Guide.Window);
			guide.init();

			reloadListeners(() => guide.reload());

			window.fmgGuide = window.fmgDebug ? undefined : guide;
            break
    
        case "list":

			appendStyle(listStyle);

            await waitForGlobalsLoaded(["List"]);

            const list = new FMG_List(window as MG.List.Window);

            window.fmgList = window.fmgDebug ? undefined : list;
            break
    
        default:
            return
    }

	waitForDomLoaded().then(() => {
		//Hide non-pro elements
		$([
			"#blobby-left", ".upgrade", ".progress-buttons ~ .inset",               // map
			"#button-upgrade", "p ~ h5 ~ p ~ h4 ~ blockquote", "p ~ h5 ~ p ~ h4"    // guide
		].join(",")).hide();
	})
})();

window.addEventListener("message", (e) => {
    switch (e.data.type) {
        case "mg:error":
            window.toastr.error(e.data.message);
            break
    } 
})