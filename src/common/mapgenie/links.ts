import type mapgenieService from "@/services/mapgenie.service";

type GameWithMaps = MG.Api.Game | MG.Api.GameFull;
type MapInfo = MG.Api.Map | MG.Api.MapFullForGame | MG.Map;

const getLinkMapName = ($link: JQuery<HTMLAnchorElement>) => {
  return $link
    .text()
    .replace(/\s*\[(WIP|PRO)\]\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isLockedMapLink = (link: HTMLAnchorElement) => {
  const href = link.getAttribute("href")?.trim();
  if (!href || href === "#") return true;

  try {
    return new URL(link.href).pathname.endsWith("/upgrade");
  } catch {
    return link.href.endsWith("/upgrade");
  }
};

const getProLinks = ($links: JQuery<HTMLAnchorElement>) => {
  return $links.filter(function () {
    return isLockedMapLink(this);
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

const createMapByTitle = (maps: MapInfo[]) => {
  return Object.fromEntries(maps.map((m) => [m.title.trim(), m]));
};

const getFreeLinkUrl = (
  $links: JQuery<HTMLAnchorElement>,
  game: GameWithMaps
) => {
  const freeLink = $links.toArray().find((link) => !isLockedMapLink(link));
  if (freeLink) {
    return new URL(freeLink.href);
  }

  const freeMap = game.maps.find((map) => !map.premium && map.available);
  const fallbackMap = freeMap ?? game.maps.find((map) => !map.premium);

  if (!fallbackMap) {
    return null;
  }

  return new URL(`${game.config.url}/maps/${fallbackMap.slug}`);
};

const fixLink = (
  link: HTMLAnchorElement,
  mapByTitle: Record<string, MapInfo>,
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

  const currentMapId = window.mapData?.map.id;
  const game = currentMapId
    ? (await mapgenie.fetchMap(currentMapId)).game
    : await mapgenie.fetchGameInfo(window.game!.id);

  const freeMapUrl = getFreeLinkUrl($sidebarLinks, game);
  if (!freeMapUrl) {
    logger.warn("No free map found, can not unlock map selector panel.");
    return;
  }

  const mapByTitle = createMapByTitle([
    ...game.maps,
    ...(window.mapData?.maps ?? []),
  ]);

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

  const freeMapUrl = getFreeLinkUrl($mapLinks, game);
  if (!freeMapUrl) {
    logger.warn("No free map found, can not pro links in game home page.");
    return;
  }

  const mapByTitle = createMapByTitle(game.maps);

  $proMapLinks.each((_, link) => fixLink(link, mapByTitle, freeMapUrl));
};
