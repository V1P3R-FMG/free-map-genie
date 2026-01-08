import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { createService, Memoize, type ProxiedObject } from "@/common/messaging";

class MapgenieService {
  private readonly axios = setupCache(
    axios.create({
      baseURL: import.meta.env.MAPGENIE_API_URL,
      headers: $headers,
    }),
    {
      interpretHeader: false,
      ttl: 1000 * 60, // 1 minute
    }
  );

  @Memoize()
  public async fetchGames() {
    const { data } = await this.axios.get<MG.Api.Game[]>("/games");
    return data;
  }

  @Memoize()
  public async fetchGame(gameId: number) {
    const { data } = await this.axios.get<MG.Api.GameFull>(
      `/games/${gameId}/full`
    );
    return data;
  }

  @Memoize()
  public async fetchHeatmaps(mapId: number) {
    const { data } = await this.axios.get<MG.Api.HeatmapGroup[]>(
      `/maps/${mapId}/heatmaps`
    );
    return data;
  }

  @Memoize()
  public async getDomainForGame(gameId: number): Promise<string> {
    const game = await this.fetchGame(gameId);
    return game.domain;
  }
}

const mapgenieService = createService({
  context() {
    return new MapgenieService();
  },
  heartbeatTimeout: 10000,
  namespace: "MapgenieService",
});

namespace mapgenieService {
  export type Instance = ProxiedObject<MapgenieService>;
}

export default mapgenieService;
