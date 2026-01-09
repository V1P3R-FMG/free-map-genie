import type { LocalV1Data } from "../v1";
import type { UserData } from "@/common/storage/format";

export class V1MigratorHelper {
  private migrateLocations(legacyData: LocalV1Data) {
    return legacyData.sharedData?.locations ?? {};
  }

  private migrateCategories(legacyData: LocalV1Data) {
    const categories = new Set<number>();
    for (const mapId in legacyData.mapData) {
      const mapData = legacyData.mapData?.[mapId];
      for (const categoryIdStr in mapData?.categories ?? {}) {
        categories.add(Number(categoryIdStr));
      }
    }
    return Array.from(categories);
  }

  public async migrate(legacyData: LocalV1Data): Promise<UserData> {
    const locations = this.migrateLocations(legacyData);
    const trackedCategoryIds = this.migrateCategories(legacyData);

    return {
      locations,
      trackedCategoryIds,
      presets: [],
      presetOrdering: [],
      notes: [],
    };
  }
}
