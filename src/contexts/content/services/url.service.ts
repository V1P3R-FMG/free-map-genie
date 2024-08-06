import mapService from "./map.service";

class UrlService {
    private readonly params = new URLSearchParams(window.location.search);

    public getMockMap() {
        if (!window.mapData) throw "Failed to fetch mock map id, window.mapData not found.";

        const mapSlug = this.params.get("map-slug");
        if (!mapSlug) return null;

        const map = mapService.getMapFromSlug(mapSlug);
        if (!map) throw `Invalid map-slug search param map with ${mapSlug} not found.`;

        return map;
    }
}

export default new UrlService();
