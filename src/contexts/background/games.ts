export type Game = MG.Api.Game;
export type GameMap = MG.Api.GameMap;

let gamesPromise: Promise<Game[]>;
let games: Game[];

function getGamesUrl() {
    if (__DEBUG__) return chrome.runtime.getURL("games.json");
    return "https://mapgenie.io/api/v1/games";
}

export async function getGames(): Promise<MG.Api.Game[]> {
    if (games) return games;
    if (gamesPromise) return gamesPromise;

    return (gamesPromise = (async () => {
        const res = await fetch(getGamesUrl());
        const json = await res.json();
        return (games = json);
    })());
}

export async function getGame(gameId: number): Promise<Nullable<MG.Api.Game>> {
    const games = await getGames();
    return games.find((game) => game.id === gameId) ?? null;
}

export async function getGameMap(
    gameId: number,
    mapId: number
): Promise<Nullable<MG.Api.GameMap>> {
    const game = await getGame(gameId);
    return game?.maps.find((map) => map.id === mapId) ?? null;
}
