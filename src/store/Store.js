
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import your slices
import prebuildReducer from "./slices/PrebuildSlice";
import catalogReducer from "./slices/CatalogSlice"; 
import quotesReducer from "./slices/QuotesSlice"

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  prebuild: prebuildReducer,
  catalog: catalogReducer,
  quotes: quotesReducer,
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
