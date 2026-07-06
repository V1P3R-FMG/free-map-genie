import { UserData } from "../../format";
import {
  LocationModelV1,
  CategoryModelV1,
  PresetsRepositoryV1,
  PresetModelV1,
  PresetOrderModelV1,
  NotesRepositoryV1,
  NoteModelV1,
  Repositories,
} from "./repositories";

export interface Exported {
  locations: LocationModelV1[];
  categories: CategoryModelV1[];
  presets: PresetModelV1[];
  presetsOrdering: PresetOrderModelV1[];
  notes: NoteModelV1[];
}

export class ExportHelper {
  private readonly repositories: Repositories;

  public constructor(repositories: Repositories) {
    this.repositories = repositories;
  }

  public async export(
    userId: number,
    gameId?: number
  ): Promise<Record<string, UserData>> {
    const locations = await this.repositories.locations.export({
      user_id: userId,
      game_id: gameId,
    });

    const categories = await this.repositories.categories.export({
      user_id: userId,
      game_id: gameId,
    });

    const presets = await this.repositories.presets.export({
      user_id: userId,
      game_id: gameId,
    });

    const presetsOrdering = await this.repositories.presetsOrdering.export({
      user_id: userId,
      game_id: gameId,
    });

    const notes = await this.repositories.notes.export({
      user_id: userId,
      game_id: gameId,
    });

    return this.groupGames({
      locations,
      categories,
      presets,
      presetsOrdering,
      notes,
    });
  }

  private groupGames({
    locations,
    categories,
    presets,
    presetsOrdering,
    notes,
  }: Exported): Record<string, UserData> {
    const games: Record<string, UserData> = {};

    presetsOrdering.sort((a, b) => a.order - b.order);

    const getOrCreateGame = (gameId: number) => {
      if (!games[gameId]) {
        games[gameId] = {
          locations: {},
          trackedCategoryIds: [],
          presets: [],
          presetOrdering: [],
          notes: [],
        };
      }
      return games[gameId];
    };

    for (const location of locations) {
      const game = getOrCreateGame(location.game_id);
      game.locations[location.id] = true;
    }

    for (const category of categories) {
      const game = getOrCreateGame(category.game_id);
      game.trackedCategoryIds.push(category.id);
    }

    for (const preset of presets) {
      const game = getOrCreateGame(preset.game_id);
      game.presets.push(PresetsRepositoryV1.asPreset(preset));
    }

    for (const ordering of presetsOrdering) {
      const game = getOrCreateGame(ordering.game_id);
      game.presetOrdering.push(ordering.id);
    }

    for (const note of notes) {
      const game = getOrCreateGame(note.game_id);
      game.notes.push(NotesRepositoryV1.asNote(note));
    }

    return games;
  }
}
