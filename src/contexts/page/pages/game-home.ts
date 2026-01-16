import { Page } from "./page";
import mapgenieService from "@/services/mapgenie.service";

export class GameHomePage extends Page {
  private readonly mapgenie = mapgenieService.use();

  public async unlockProMaps() {
    const links = $(".game-item")
      .toArray()
      .map((link) => {
        const $link = $(link);
        const isPro = $link.attr("href")?.endsWith("/upgrade") ?? false;
        return { $link, isPro };
      });

    const proCount = links.filter(({ isPro }) => isPro).length;
    if (proCount === 0) {
      // No pro maps, nothing to unlock
      return;
    }

    const $firstFreeLink = links.find(({ isPro }) => !isPro)?.$link;
    if (!$firstFreeLink) {
      logger.warn("No free game link found to unlock pro maps");
      return;
    }

    const { origin, pathname } = new URL($firstFreeLink.attr("href")!);

    const [_, slug] = location.pathname.split("/");
    const game = await this.mapgenie.fetchGameBySlug(slug);
    const mapsByTitle = Object.fromEntries(
      game.maps.map((m) => [m.title.trim(), m])
    );

    links.forEach(({ $link, isPro }) => {
      if (!isPro) return;

      const name = $link
        .text()
        .replace(/\[(WIP|PRO)\]/, "")
        .trim();

      const map = mapsByTitle[name];

      if (!map) {
        logger.warn(`Could not find game data for ${name}`);
        return;
      }

      $link.attr("href", `${origin}${pathname}?fmgMapId=${map.id}`);
      $link.attr("style", "");

      $link.removeClass("unavailable");
      $link.removeAttr("target");
      $link.removeAttr("data-placement");
      $link.removeAttr("data-original-title");
      $link.removeAttr("data-toggle");
    });
  }

  public async start() {
    await this.unlockProMaps();
  }

  public async info(): Promise<Record<string, any>> {
    return {};
  }
}
