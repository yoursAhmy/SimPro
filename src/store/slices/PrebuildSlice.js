// src/redux/slices/prebuildSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prebuilds: [],
  companyId: null,
};

const prebuildSlice = createSlice({
  name: "prebuild",
  initialState,
  reducers: {
    setPrebuildData: (state, action) => {
      state.prebuilds = action.payload.prebuilds;
      state.companyId = action.payload.companyId;
    },
    clearPrebuildData: (state) => {
      state.prebuilds = [];
      state.companyId = null;
    },
  },
});

export const { setPrebuildData, clearPrebuildData } = prebuildSlice.actions;
export default prebuildSlice.reducer;
