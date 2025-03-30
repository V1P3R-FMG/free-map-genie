import channel from "@shared/channel/background";

declare global {
    interface BackgroundChannel {
        games(): MG.API.Game[];
        game(data: { gameId: Id }): MG.API.GameFull;
        heatmaps(data: { mapId: Id }): MG.API.Heatmaps;
    }
}

async function apiFetch(path: string) {
    const secret = /* @mangle */ __GLOBAL_API_SECRET__; /* @/mangle */

    const urlWithoutStartingSlash = path.replace(/^\//, "");
    const targetUrl = [`https://mapgenie.io/api/v1`, urlWithoutStartingSlash].join("/");

    const res = await fetch(targetUrl, {
        headers: {
            "X-Api-Secret": secret
        }
    });

    return res.json();
}

channel.onMessage("games", () => {
    return apiFetch("games");
});

channel.onMessage("game", ({ gameId }) => {
    return apiFetch(`games/${gameId}/full`);
});

channel.onMessage("heatmaps", ({ mapId }) => {
    return apiFetch(`maps/${mapId}/heatmaps`);
});