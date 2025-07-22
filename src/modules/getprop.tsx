import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, addShellResultToAcquisition } from '../utils/acquisition';

export const getpropModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		const env = await client.shellV2('getprop');
		await addShellResultToAcquisition(env, acq, 'getprop');
	},
	name: 'Device Properties',
};
