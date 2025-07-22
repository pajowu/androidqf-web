import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, runShellAndAddToAcquisition } from '../utils/acquisition';

export const logcatModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		await runShellAndAddToAcquisition(acq, client, 'logcat -d -b all "*:V"', 'logcat');
	},
	name: 'Logcat',
};
