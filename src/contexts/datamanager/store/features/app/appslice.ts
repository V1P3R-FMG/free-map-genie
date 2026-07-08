import { createSlice } from "@reduxjs/toolkit";
import {
  createAppAsyncThunk,
  createAppSelector,
} from "@/contexts/dataManager/store/typed";
import { toastr } from "react-redux-toastr";

export interface AppState {
  loadingCount: number;
  games: MG.Api.Game[];
}

const initialState: AppState = {
  loadingCount: 0,
  games: [],
};

export const injectIconFontAsync = createAppAsyncThunk(
  "app/injectIconFont",
  async (_) => {
    try {
      await injectStyle("/assets/fmg-icons.css");
    } catch (error) {
      toastr.error("Error", "Failed to inject icon font.");
      logger.error("Failed to inject icon font", error);
    }
  }
);

export const fetchGamesAsync = createAppAsyncThunk(
  "app/fetchGames",
  async (_, { extra: { services } }) => {
    try {
      return services.mapgenie.fetchGames();
    } catch (error) {
      toastr.error("Error", "Failed to fetch games from MapGenie.");
      logger.error("Failed to fetch games", error);
      return [];
    }
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(injectIconFontAsync.pending, (state, action) => {
        state.loadingCount += 1;
      })
      .addCase(injectIconFontAsync.fulfilled, (state) => {
        state.loadingCount -= 1;
      })
      .addCase(fetchGamesAsync.pending, (state) => {
        state.loadingCount += 1;
      })
      .addCase(fetchGamesAsync.fulfilled, (state, action) => {
        state.loadingCount -= 1;
        state.games = action.payload;
      });
  },
  selectors: {
    selectAppLoading: (state) => state.loadingCount > 0,
    selectGames: (state) => state.games,
  },
});

export const {} = appSlice.actions;

export const { selectAppLoading, selectGames } = appSlice.selectors;

export const selectGameById = createAppSelector(
  [(state) => selectGames(state), (_, gameId: Id) => gameId],
  (game, gameId) => game.find((g) => g.id == gameId)
);

export default appSlice.reducer;
