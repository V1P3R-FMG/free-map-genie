interface EventLike {
  target: HTMLElement;
}

type Id = string | number;

interface Window {
  // map
  user?: MG.User;
  game?: MG.Game;
  mapData?: MG.MapData;
  config?: MG.Config;

  mapUrl?: string;
  baseUrl?: string;
  cdnUrl?: string;
  tilesCdnUrl?: string;
  storageUrl?: string;

  initialZoom?: Int;
  initialPosition?: MG.Position;

  store?: MG.Store;
  mapManager?: MG.MapManager;
  map?: MG.MapboxglMap;

  // guide
  isPro?: boolean;
  foundLocations?: Record<Id, boolean>;
  mapElement?: HTMLIFrameElement;
  // new world guide
  mapsById?: Record<Id, MG.Map>;
  categoriesById?: Record<Id, MG.Category>;
  regionsById?: Record<Id, MG.Region>;

  // libraries
  axios?: import("axios").Axios;
}

interface WindowEventMap {
  locationMarked: CustomEvent<Client.LocationEvent>;
}
