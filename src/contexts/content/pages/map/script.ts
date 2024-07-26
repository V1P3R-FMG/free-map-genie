function appendReadyMapScript() {
    const script = $<HTMLScriptElement>("script[src^='https://cdn.mapgenie.io/js/map.js?id=']").get(0);

    if (!script) throw "Mapgenie map.js script not found.";

    script.remove();

    $("<script/>").attr("src", script.src.replace("id=", "ready&id=")).appendTo(document.body);
}

function fixGoogleMaps() {
    if (window.config?.altMapSdk) {
        window.google ??= {} as MG.Google;
        window.google.maps = {
            Size: function () {},
        };
    }
}

export default function fixMapScript() {
    fixGoogleMaps();
    appendReadyMapScript();
}
