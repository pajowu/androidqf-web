import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, runShellAndAddToAcquisition } from '../utils/acquisition';

export const envModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		await runShellAndAddToAcquisition(acq, client, 'env', 'env');
	},
	name: 'Environment',
};
