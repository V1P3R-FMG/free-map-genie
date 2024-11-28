import getPageType from "./page";
import Games from "./games";

import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";
import channel from "@shared/channel/background";

function getAppleTouchIcon(gameSlug: string) {
    return `https://cdn.mapgenie.io/favicons/${gameSlug}/apple-touch-icon.png`;
}

async function getTitle(url: string) {
    return channel.offscreen.title({ url });
}

function getLocationUrl(url: string) {
    const { pathname, origin, searchParams } = new URL(url);

    if (searchParams.has("map-slug")) {
        return `${origin}${pathname}?map-slug=${searchParams.get("map-slug")}`;
    }

    return `${origin}${pathname}`;
}

function mapTitle(game: MG.Api.Game, map: MG.Api.Map) {
    if (game.title === map.title) {
        return game.title;
    }
    return `${game.title} | ${map.title}`;
}

async function createBookmarkForMap(url: string): Promise<BookmarkData> {
    const game = await Games.findGameFromUrl(url);
    if (!game) throw `game with url ${url} not found.`;

    const map = await Games.findMapFromUrl(url);
    if (!map) throw `map with url ${url} not found.`;

    return {
        type: "map",
        title: mapTitle(game, map),
        url: getLocationUrl(url),
        icon: getAppleTouchIcon(game.slug),
        preview: map.image ?? undefined,
        game: game.title,
        gameId: game.id,
        map: map.title,
        mapId: map.id,
        gameIcon: game.image,
    };
}

async function createBookmarkForGuide(url: string): Promise<BookmarkData> {
    const game = await Games.findGameFromUrl(url);
    if (!game) throw `game with url ${url} not found.`;

    return {
        type: "guide",
        title: await getTitle(url),
        url: getLocationUrl(url),
        icon: "",
        preview: getAppleTouchIcon(game.slug),
        game: game.title,
        gameId: game.id,
        gameIcon: game.image,
    };
}

async function createBookmarkForGameHome(url: string): Promise<BookmarkData> {
    const game = await Games.findGameFromUrl(url);
    if (!game) throw `game with url ${url} not found.`;

    return {
        type: "game-home",
        title: await getTitle(url),
        url: getLocationUrl(url),
        icon: "",
        preview: getAppleTouchIcon(game.slug),
        game: game.title,
        gameId: game.id,
        gameIcon: game.image,
    };
}

export default async function createBookmark(url: string): Promise<BookmarkData> {
    const pageType = await getPageType(url);
    switch (pageType) {
        case "map":
            return await createBookmarkForMap(url);
        case "guide":
            return await createBookmarkForGuide(url);
        case "game-home":
            return await createBookmarkForGameHome(url);
        case "home":
        case "login":
        case "unknown":
        default:
            throw `Unable to create bookmark for current page type ${pageType} @ ${url}.`;
    }
}
