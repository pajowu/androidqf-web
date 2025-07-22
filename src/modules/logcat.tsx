import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, addShellResultToAcquisition } from '../utils/acquisition';

export const logcatModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		const env = await client.shellV2('logcat -d -b all "*:V"');
		await addShellResultToAcquisition(env, acq, 'logcat');
	},
	name: 'Logcat',
};
