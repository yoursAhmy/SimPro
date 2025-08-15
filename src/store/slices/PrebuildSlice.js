// src/redux/slices/prebuildSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prebuilds: [],
  companyId: null,
  prebuildItems: [],
  selectedPrebuildId: null,
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
    setPrebuildItem: (state, action) => {
      state.prebuildItems = action.payload.prebuildItem;
      state.selectedPrebuildId = action.payload.selectedId; 
    },
    clearPrebuildItem: (state) => {
      state.prebuildItems = [];
      state.selectedPrebuildId = null;
    }
  },
});

export const { setPrebuildData, setPrebuildItem, clearPrebuildItem, clearPrebuildData } = prebuildSlice.actions;
export default prebuildSlice.reducer;
export const selectCompanyId = (state) => state.prebuild.companyId;