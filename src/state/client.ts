import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AdbClient } from 'wadb';

export type ClientState = {
	client: AdbClient | null;
};
export const clientSlice = createSlice({
	name: 'client',
	initialState: { client: null } as ClientState,
	reducers: {
		setClient: (slice, action: PayloadAction<AdbClient | null>) => {
			slice.client = action.payload;
		},
	},
});

export const { setClient } = clientSlice.actions;
