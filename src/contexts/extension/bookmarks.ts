import { getPageType } from "@utils/fmg-page";

import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";
import { sendMessage } from "@shared/channel/extension";

export type CreateBookmarkResult = { success: true; data: BookmarkData } | { success: false; data: string };

function bookmarkResultSuccess(bookmark: BookmarkData): CreateBookmarkResult {
    return {
        success: true,
        data: bookmark,
    };
}

function bookmarkResultFailed(message: string): CreateBookmarkResult {
    return {
        success: false,
        data: `failed to create bookmark, ${message}`,
    };
}

function getMeta(name: string) {
    const content = document.querySelector(`head > meta[property='${name}']`)?.getAttribute("content");
    if (!content) {
        throw `meta[${name}] not found.`;
    }
    return content;
}

function getAppleTouchIcon() {
    const href = document.querySelector("head > link[rel='apple-touch-icon']")?.getAttribute("href");
    if (!href) {
        throw `apple touch icon not found.`;
    }
    return href;
}

function getLocationUrl() {
    const params = new URLSearchParams(window.location.search);
    const url = new URL(window.location.pathname, window.location.origin);

    if (params.has("map-slug")) {
        url.searchParams.append("map-slug", params.get("map-slug")!);
    }

    return url.toString();
}

async function findGameBySlug(gameSlug: string): Promise<MG.Api.Game | undefined> {
    return sendMessage("background", "games:find:game:from:slug", { gameSlug });
}

async function findGameByDomain(domain: string): Promise<MG.Api.Game | undefined> {
    return sendMessage("background", "games:find:game:from:domain", { domain });
}

async function findMapByDomain(domain: string): Promise<MG.Api.Map | undefined> {
    const game = await findGameByDomain(domain);
    return game?.maps[0];
}

async function findMapBySlugs(gameSlug: string, mapSlug: string): Promise<MG.Api.Map | undefined> {
    return sendMessage("background", "games:find:map:from:slug", { gameSlug, mapSlug });
}

async function findMap(gameSlug?: string, mapSlug?: string) {
    return !gameSlug || !mapSlug ? findMapByDomain(window.location.origin) : findMapBySlugs(gameSlug, mapSlug);
}

async function findGame(gameSlug?: string) {
    return !gameSlug ? findGameByDomain(window.location.origin) : findGameBySlug(gameSlug);
}

function getInfoFromHref(): { gameSlug?: string; mapSlug?: string } {
    const params = new URLSearchParams(window.location.search);
    const [_, gameSlug, __, mapSlug] = window.location.pathname.split("/");
    switch (getPageType()) {
        case "map":
            if (params.has("map-slug")) {
                return { gameSlug, mapSlug: params.get("map-slug")! };
            } else {
                return { gameSlug, mapSlug };
            }
        case "game-home":
        case "guide":
            return { gameSlug };
        case "home":
        case "login":
        case "unknown":
            return {};
    }
}

function mapTitle(game: MG.Api.Game, map: MG.Api.Map) {
    if (game.title === map.title) {
        return game.title;
    }
    return `${game.title} | ${map.title}`;
}

async function createBookmarkForMap(): Promise<Promise<CreateBookmarkResult>> {
    const { gameSlug, mapSlug } = getInfoFromHref();

    const game = await findGame(gameSlug);
    const map = await findMap(gameSlug, mapSlug);

    if (!game) {
        if (!gameSlug) {
            return bookmarkResultFailed(`game with domain ${window.location.origin} not found.`);
        } else {
            return bookmarkResultFailed(`game with slug ${gameSlug} not found.`);
        }
    }

    if (!map) {
        if (!mapSlug) {
            return bookmarkResultFailed(`map with domain ${window.location.origin} not found.`);
        } else {
            return bookmarkResultFailed(`map with slug ${mapSlug} not found in game ${game.title}.`);
        }
    }

    return bookmarkResultSuccess({
        type: "map",
        title: mapTitle(game, map),
        url: getLocationUrl(),
        icon: getAppleTouchIcon(),
        preview: map.image ?? undefined,
        game: game.title,
        gameId: game.id,
        map: map.title,
        mapId: map.id,
        gameIcon: game.image,
    });
}

async function createBookmarkForGuide(): Promise<CreateBookmarkResult> {
    const { gameSlug } = getInfoFromHref();

    if (!gameSlug) {
        return bookmarkResultFailed("failed to extract info from url.");
    }

    const game = await findGame(gameSlug);

    if (!game) {
        return bookmarkResultFailed(`game with slug ${gameSlug} not found.`);
    }

    return bookmarkResultSuccess({
        type: "guide",
        title: getMeta("og:title"),
        url: getLocationUrl(),
        preview: getAppleTouchIcon(),
        icon: "",
        game: game.title,
        gameId: game.id,
        gameIcon: game.image,
    });
}

async function createBookmarkForGameHome(): Promise<CreateBookmarkResult> {
    const { gameSlug } = getInfoFromHref();

    if (!gameSlug) {
        return bookmarkResultFailed("failed to extract info from url.");
    }

    const game = await findGame(gameSlug);

    if (!game) {
        return bookmarkResultFailed(`game with slug ${gameSlug} not found`);
    }

    return bookmarkResultSuccess({
        type: "game-home",
        title: getMeta("og:title"),
        url: getLocationUrl(),
        preview: getAppleTouchIcon(),
        icon: "",
        game: game.title,
        gameId: game.id,
        gameIcon: game.image,
    });
}

export async function createBookmark(): Promise<CreateBookmarkResult> {
    try {
        switch (getPageType()) {
            case "map":
                return await createBookmarkForMap();
            case "guide":
                // logging.debug("create bookmark", "guide", await createBookmarkForGuide());
                return await createBookmarkForGuide();
            case "game-home":
                return await createBookmarkForGameHome();
            case "home":
            case "login":
            case "unknown":
            default:
                return bookmarkResultFailed(`Unable to create bookmark for current page type ${getPageType()}.`);
        }
    } catch (err) {
        return bookmarkResultFailed(`${err}.`);
    }
}
