import { configureStore, createSlice } from '@reduxjs/toolkit';
import { baseApi } from '@/store/baseApi';

// Minimal placeholder so Redux doesn't warn about an empty reducer map.
// Add feature slices here as the app grows.
const appSlice = createSlice({
  name: 'app',
  initialState: {} as Record<string, never>,
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
