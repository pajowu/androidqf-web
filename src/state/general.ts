import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { isValidAgeRecipient } from '../utils/encryption';
import { getHashData } from '../utils/getHashData';

export type GeneralState = {
	encrypt: boolean;
	ageRecipient: string;
};

function getInitialState(): GeneralState {
	const initialState = { encrypt: false, ageRecipient: '' };
	const hashData = getHashData();
	if ('ageRecipient' in hashData && isValidAgeRecipient(hashData.ageRecipient)) {
		initialState.encrypt = true;
		initialState.ageRecipient = hashData.ageRecipient;
	}
	return initialState;
}

export const generalSlice = createSlice({
	name: 'general',
	initialState: getInitialState,
	reducers: {
		setAgeRecipient: (slice, action: PayloadAction<string>) => {
			slice.ageRecipient = action.payload;
		},
		setEncrypt(slice, action: PayloadAction<boolean>) {
			slice.encrypt = action.payload;
		},
	},
});

export const { setAgeRecipient, setEncrypt } = generalSlice.actions;
