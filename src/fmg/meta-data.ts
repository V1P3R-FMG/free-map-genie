export interface MetaDataOjbect {
    map: string | null;
    mapId: number | null;
}

/**
 * Gets the metadata from the URL
 */
export class FMG_MetaData {
    static get(): MetaDataOjbect {
        const params = new URL(window.location.href).searchParams;
        const map = params.get("map");
        const mapId = map
            ? window.mapData?.maps.find((m) => m.slug == map)?.id ?? null
            : null;

        if (map && !mapId) {
            console.error(
                "Map({}) not found, valid maps: ",
                window.mapData?.maps.map((map) => map.slug) || []
            );
        }

        return { map, mapId };
    }
}
