import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition } from '../utils/acquisition';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { Select } from '../components/input';
import { getHashData } from '../utils/getHashData';

enum Mode {
	OnlySMS = 'Only SMS',
	Everything = 'Everything',
}
export type BackupSlice = { mode: Mode };

function getInitialState(): BackupSlice {
	const hashData = getHashData();
	return {
		mode:
			'backup.mode' in hashData && hashData['backup.mode'] == 'everything'
				? Mode.Everything
				: Mode.OnlySMS,
	};
}
export const backupSlice = createSlice({
	name: 'backup',
	initialState: getInitialState,
	reducers: {
		setMode: (slice, action: PayloadAction<Mode>) => {
			slice.mode = action.payload;
		},
	},
});

const { setMode } = backupSlice.actions;

export const backupModule: Module = {
	render: () => {
		const mode = useAppSelector((state) => state.backup.mode);
		const dispatch = useAppDispatch();

		return (
			<>
				<Select
					label="Backup Option: "
					value={mode}
					onChange={(e) => dispatch(setMode(e.target.value as Mode))}
				>
					{Object.values(Mode).map((x) => (
						<option key={x} value={x}>
							{x}
						</option>
					))}
				</Select>
			</>
		);
	},
	run: async (acq: Acquisition, client: AdbClient, state: RootState) => {
		let service = '';
		switch (state.backup.mode) {
			case Mode.OnlySMS:
				service = 'com.android.providers.telephony';
				break;
			case Mode.Everything:
				service = '-all';
				break;
		}
		const backup = await client.backup(service);
		await acq.addFileFromReadableStream('backup.ab', backup);
	},
	name: 'Backup',
};
