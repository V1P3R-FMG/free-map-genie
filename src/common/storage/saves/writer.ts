import { SerializedFile } from "./file";

import type { UserData } from "../format";

export class SaveWriter {
  private writeGame(data: UserData) {
    return {
      locations: Object.keys(data.locations).map((loc) => Number(loc)),
      trackedCategoryIds: data.trackedCategoryIds,
      presets: data.presets,
      presetOrdering: data.presetOrdering,
      notes: data.notes,
    };
  }

  private writeGames(games: Record<number, UserData>) {
    return Object.fromEntries(
      Object.entries(games).map(([gameId, data]) => [
        gameId,
        this.writeGame(data),
      ])
    );
  }

  public write(userId: number, games: Record<number, UserData>) {
    const createdAt = new Date().toISOString();

    return new SerializedFile(
      `fmg_user_${userId}_v3_${createdAt}.json`,
      JSON.stringify({
        version: 3,
        userId,
        createdAt,
        games: this.writeGames(games),
      })
    );
  }

  public download(file: SerializedFile) {
    const blob = new Blob([file.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
