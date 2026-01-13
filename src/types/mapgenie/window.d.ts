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
  foundLocations?: Record<number, boolean>;
  mapElement?: HTMLIFrameElement;

  // libraries
  axios?: import("axios").Axios;
}
