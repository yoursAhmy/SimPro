// src/redux/slices/catalogSlice.js
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
  },
});

export const { setCatalogs } = catalogSlice.actions;
export default catalogSlice.reducer;
