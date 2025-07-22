import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, addShellResultToAcquisition } from '../utils/acquisition';

export const envModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		const env = await client.shellV2('env');
		await addShellResultToAcquisition(env, acq, 'env');
	},
	name: 'Environment',
};
