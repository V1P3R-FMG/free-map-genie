class UrlService {
    private readonly params = new URLSearchParams(window.location.search);

    public getMockMapId() {
        if (!window.mapData) throw "Failed to fetch mock map id window.mapData not found.";

        const mapSlug = this.params.get("map-slug");
        if (!mapSlug) return null;

        const map = window.mapData.maps.find((m) => m.slug === mapSlug.toLowerCase());
        if (!map) throw `Invalid map-slug search param map with ${mapSlug} not found.`;

        return map.id;
    }
}

export default new UrlService();
