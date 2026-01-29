import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  createAppAsyncThunk,
  createAppSelector,
} from "@/contexts/dataManager/store/typed";
import { SaveHelper } from "@/common/storage/saves";
import { SerializedFile } from "@/common/storage/saves/file";
import { toastr } from "react-redux-toastr";

import type { Save } from "@/common/storage/saves";
import type { UserData } from "@/common/storage";

const saveHelper = new SaveHelper();

export interface SavesState {
  list: (Save & { id: string })[];
  selectedGames: Record<Id, UserData>;
  selected: number | null;
  errors: Record<string, string[]>;
  loading: boolean;
  busy: boolean;
}

const initialState: SavesState = {
  list: [],
  selectedGames: {},
  selected: null,
  errors: {},
  loading: false,
  busy: false,
};

export const readSaves = createAppAsyncThunk(
  "saves/read",
  async (files: FileList | null) => {
    try {
      if (!files) {
        return { saves: [], errors: {} };
      }

      const serializedFiles = await Promise.all(
        Array.from(files).map(SerializedFile.fromInputFile)
      );

      const saves = saveHelper.read(serializedFiles);
      return saves;
    } catch (error) {
      toastr.error("Error", "Failed to read saves.");
      logger.error("Failed to read saves", error);
      return { saves: [], errors: {} };
    }
  }
);

export const importSelectedSave = createAppAsyncThunk(
  "saves/import",
  async (_, { getState, extra: { services } }) => {
    try {
      const state = getState();
      const save = selectCurrentSave(state);
      if (!save) {
        throw new Error("No save selected");
      }
      const games = selectSelectedGames(state);
      await services.backend.import(games);

      toastr.success("Success", "Selected games imported successfully.");
    } catch (error) {
      toastr.error("Error", "Failed to import selected save.");
      logger.error("Failed to import selected save", error);
    }
  }
);

export const savesSlice = createSlice({
  name: "saves",
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<number | null>) => {
      state.selected = action.payload;
      state.selectedGames = {};

      if (state.selected === null) return;

      const save = state.list[state.selected];
      if (!save) return;

      for (const gameId in save.games) {
        state.selectedGames[gameId] = save.games[gameId];
      }
    },
    setGameSelected: (
      state,
      action: PayloadAction<{ gameId: Id; selected: boolean }>
    ) => {
      const { gameId, selected } = action.payload;
      if (selected) {
        const save = state.list[state.selected!];
        state.selectedGames[gameId] = save.games[gameId];
      } else {
        delete state.selectedGames[gameId];
      }
    },
    removeSave: (state, action: PayloadAction<number>) => {
      const index = action.payload;

      state.list = [...state.list];
      state.list.splice(index, 1);

      if (state.selected === null) return;

      if (state.selected === index) {
        state.selected = null;
      } else if (state.selected > index) {
        state.selected -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(readSaves.pending, (state) => {
        state.list = [];
        state.errors = {};
        state.loading = true;
        state.selected = null;
        state.selectedGames = {};
      })
      .addCase(readSaves.fulfilled, (state, action) => {
        state.list = action.payload.saves.map((save) => ({
          id: save.filenames.join("|"),
          ...save,
        }));
        state.errors = action.payload.errors;
        state.loading = false;
      })
      .addCase(importSelectedSave.pending, (state) => {
        state.busy = true;
      })
      .addCase(importSelectedSave.fulfilled, (state) => {
        state.busy = false;
      });
  },
  selectors: {
    selectSaves: (state) => state.list,
    selectIsLoading: (state) => state.loading,
    selectIsBusy: (state) => state.busy,
    selectSelected: (state) => state.selected,
    selectIsSelected: (state, index: number) => state.selected === index,
    selectIsGameSelected: (state, gameId: Id) => !!state.selectedGames[gameId],
    selectErrors: (state) => state.errors,
    selectCurrentSave: (state) => {
      if (state.selected === null) return null;
      return state.list[state.selected] || null;
    },
    selectSelectedGames: (state) => {
      if (state.selected === null) return {};
      return state.selectedGames;
    },
  },
});

export const { setSelected, removeSave, setGameSelected } = savesSlice.actions;

export const {
  selectSaves,
  selectIsLoading,
  selectIsBusy,
  selectSelected,
  selectIsSelected,
  selectIsGameSelected,
  selectErrors,
  selectCurrentSave,
  selectSelectedGames,
} = savesSlice.selectors;

export const selectErrorsForSave = createAppSelector(
  [selectErrors, (_, save: Save | null) => (save ? save.filenames : [])],
  (errors, filenames) => {
    return filenames.flatMap((filename) => errors[filename] || []);
  }
);

export const selectErrorCount = createAppSelector(
  [selectErrors, (_, filenames: string[]) => filenames],
  (errors, filenames) => {
    return filenames.reduce((acc, filename) => {
      return acc + (errors[filename]?.length || 0);
    }, 0);
  }
);

export default savesSlice.reducer;
