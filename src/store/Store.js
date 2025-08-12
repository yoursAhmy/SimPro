// src/redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import your slices
import prebuildReducer from "./slices/PrebuildSlice";
import catalogReducer from "./slices/CatalogSlice"; 

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  prebuild: prebuildReducer,
  catalog: catalogReducer, // <-- added new reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
