
import { createSlice } from "@reduxjs/toolkit";

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    catalogs: [],
  },
  reducers: {
    setCatalogs: (state, action) => {
      state.catalogs = action.payload;
    },
    clearCatalogs: (state) => {
      state.catalogs= [];
    }
  },
});

export const { setCatalogs, clearCatalogs } = catalogSlice.actions;
export default catalogSlice.reducer;
