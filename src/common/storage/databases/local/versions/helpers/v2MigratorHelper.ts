import type { LocalV2Data } from "../v2.schema";
import type { UserData } from "@/common/storage/format";

export class V2MigratorHelper {
  private migrateLocations(legacyData: LocalV2Data) {
    const locations: Record<number, boolean> = {};
    for (const mapId in legacyData) {
      const mapData = legacyData[mapId];
      mapData.locationIds?.forEach((id) => (locations[id] = true));
    }
    return locations;
  }

  private migrateCategories(legacyData: LocalV2Data) {
    const categories = new Set<number>();
    for (const mapId in legacyData) {
      const mapData = legacyData[mapId];
      mapData.categoryIds?.forEach((id) => categories.add(id));
    }
    return Array.from(categories);
  }

  private migrateNotes(legacyData: LocalV2Data) {
    const notes: MG.Note[] = [];

    for (const mapId in legacyData) {
      const mapData = legacyData[mapId];
      mapData.notes?.forEach((note) =>
        notes.push({
          created_at: new Date().toISOString(),
          ...note,
        })
      );
    }

    return notes;
  }

  public migrate(legacyData: LocalV2Data): UserData {
    const locations = this.migrateLocations(legacyData);
    const trackedCategoryIds = this.migrateCategories(legacyData);
    const notes = this.migrateNotes(legacyData);

    return {
      locations,
      trackedCategoryIds,
      presets: [],
      presetOrdering: [],
      notes,
    };
  }
}
