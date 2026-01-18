import type mapgenieService from "@/services/mapgenie.service";

const getLinkMapName = ($link: JQuery<HTMLAnchorElement>) => {
  return $link
    .text()
    .replace(/\[(WIP|PRO)\]/, "")
    .trim();
};

const getProLinks = ($links: JQuery<HTMLAnchorElement>) => {
  return $links.filter(function () {
    return this.href.endsWith("/upgrade");
  });
};

const getProHeaderLinks = (
  $headerLinks: JQuery<HTMLAnchorElement>,
  $proSidebarLinks: JQuery<HTMLAnchorElement>
) => {
  const names = new Set(
    $proSidebarLinks.map((_, link) => getLinkMapName($(link)))
  );

  return $headerLinks.filter(function () {
    return names.has(getLinkMapName($(this)));
  });
};

const createMapByTitle = (game: MG.Api.GameFull) => {
  return Object.fromEntries(game.maps.map((m) => [m.title.trim(), m]));
};

const fixLink = (
  link: HTMLAnchorElement,
  mapByTitle: Record<string, MG.Api.MapFull>,
  freeUrl: URL
) => {
  const $link = $(link);
  const name = getLinkMapName($link);

  const map = mapByTitle[name];

  if (!map) {
    logger.warn(`Could not find map data for ${name}`);
    return;
  }

  const { origin, pathname } = freeUrl;

  // For map links we have to update the selected class
  if (window.mapData) {
    $link.toggleClass("selected", map.id === window.mapData?.map.id);
  }

  $link.attr("href", `${origin}${pathname}?fmgMapId=${map.id}`);
  $link.attr("style", "");

  $link.removeClass("unavailable");
  $link.removeAttr("title");
  $link.removeAttr("target");
  $link.removeAttr("data-placement");
  $link.removeAttr("data-toggle");
  $link.removeAttr("data-original-title");
};

export const fixMapLinks = async (mapgenie: mapgenieService.Instance) => {
  const $sidebarLinks = $<HTMLAnchorElement>("#left-sidebar a.map-link");
  const $headerLinks = $<HTMLAnchorElement>("#header a.map-link");

  const $proSidebarLinks = getProLinks($sidebarLinks);
  const $proHeaderLinks = getProHeaderLinks($headerLinks, $proSidebarLinks);

  if (!$proSidebarLinks.length) return;

  const parmas = new URLSearchParams(window.location.search);
  if (parmas.has("fmgMapId")) {
    $("a.map-link.selected").toggleClass("selected", false);
  }

  // Get game for this map
  const game = await mapgenie.fetchGame(window.game!.id);

  // Get first free map we find
  const freeMap = game.maps.find((map) => !map.premium);

  if (!freeMap) {
    logger.warn("No free map found, can not unlock map selector panel.");
    return;
  }

  const freeMapUrl = new URL(freeMap.url);
  const mapByTitle = createMapByTitle(game);

  $proSidebarLinks.each((_, link) => fixLink(link, mapByTitle, freeMapUrl));
  $proHeaderLinks.each((_, link) => fixLink(link, mapByTitle, freeMapUrl));
};

export const fixGameHomeLinks = async (mapgenie: mapgenieService.Instance) => {
  const $mapLinks = $<HTMLAnchorElement>("a.game-item");

  const $proMapLinks = getProLinks($mapLinks);

  if (!$proMapLinks.length) return;

  // Get game from url pathname
  const [_, slug] = location.pathname.split("/");
  const game = await mapgenie.fetchGameBySlug(slug);

  // Get first free map we find
  const freeMap = game.maps.find((map) => !map.premium);

  if (!freeMap) {
    logger.warn("No free map found, can not pro links in game home page.");
    return;
  }

  const freeMapUrl = new URL(freeMap.url);
  const mapByTitle = createMapByTitle(game);

  $proMapLinks.each((_, link) => fixLink(link, mapByTitle, freeMapUrl));
};
