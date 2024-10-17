import Games from "./games";

export default async function getPageType(url: string): Promise<MG.PageType> {
    const { origin, pathname } = new URL(url);

    if (origin === "https://mapgenie.io" && pathname === "/") {
        return "home";
    }

    const [_, gameSlug, type, mapSlug] = pathname.split("/");
    const game = await Games.findGameFromUrl(url);

    if (!game) {
        return "unknown";
    }

    if (pathname.endsWith("/login")) {
        return "login";
    }

    if (!gameSlug && !mapSlug) {
        return "map";
    }

    if (gameSlug && !mapSlug) {
        switch (type) {
            case "checklist":
                return "guide";
            default:
                return "game-home";
        }
    }

    if (gameSlug && mapSlug) {
        switch (type) {
            case "maps":
                return "map";
            case "guides":
            case "checklists":
                return "guide";
        }
    }

    return "unknown";
}
