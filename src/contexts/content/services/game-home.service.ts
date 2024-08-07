import gameHomePage from "@content/pages/game-home.page";
import gamesChannel from "@content/channels/games.channel";

class GameHomeService {
    public findFreeMapUrl() {
        for (const item of gameHomePage.gameCards) {
            if (!item.classList.contains("unavailable")) {
                return item.getAttribute("href") ?? "";
            }
        }
        return null;
    }

    public getMapNameFromLabel(label: string) {
        return label.replace(/\s?\[\w+\]/i, "");
    }

    public async getMapFromName(name: string) {
        const game = await this.getGameFromTitle();
        if (!game) {
            console.warn("Failed to unlock pro maps, game not found from document.title.");
            return null;
        }
        return game.maps.find((map) => map.title === name);
    }

    public getLabelFromGameCard(gameCard: JQuery<HTMLAnchorElement>) {
        return gameCard.find("h4").text();
    }

    public async getGameFromTitle() {
        const games = await gamesChannel.getAll();
        return games.find((game) => game.meta_title === document.title);
    }

    public async unlockProMaps() {
        const freeMapUrl = this.findFreeMapUrl();
        if (!freeMapUrl) {
            logger.warn("Failed to unlock pro maps, free map url not found.");
            return;
        }

        for (const item of gameHomePage.gameCards) {
            if (item.classList.contains("unavailable")) {
                // Fix the href
                const url = new URL(freeMapUrl);

                const label = this.getLabelFromGameCard($(item));
                const mapName = this.getMapNameFromLabel(label);

                const map = await this.getMapFromName(mapName);
                if (!map) {
                    console.warn(`Failed to unlock pro map ${label}, map not found.`);
                    return;
                }

                if (map.available) return;

                url.searchParams.set("map-slug", map.slug);
                item.setAttribute("href", url.toString());

                // Remove the unavailable class
                item.classList.remove("unavailable");

                // Remove the unnecessary attributes
                item.removeAttribute("target");
                item.removeAttribute("data-toggle");
                item.removeAttribute("title");
                item.removeAttribute("data-placement");
                item.removeAttribute("data-original-title");

                // Fix title
                const title = item.querySelector<HTMLHeadingElement>(".card-title");
                if (title)
                    title.innerText = title.innerText.replace(/\s\[PRO\]/i, map.work_in_progress ? " [WIP]" : "");
            }
        }
    }
}

export default new GameHomeService();
