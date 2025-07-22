import { Reducer, configureStore } from '@reduxjs/toolkit';
import { ALL_SLICES, modulesSlice } from '../modules';
import { generalSlice } from './general';
import { clientSlice } from './client';

export const reducers = Object.fromEntries([
	...Object.entries(ALL_SLICES).map(([k, v]) => [k, v.reducer] as [typeof k, Reducer]),
	['modules', modulesSlice.reducer],
	['general', generalSlice.reducer],
	['client', clientSlice.reducer],
]);

export const store = configureStore({
	reducer: reducers,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
