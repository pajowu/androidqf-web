import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, runShellAndAddToAcquisition } from '../utils/acquisition';

export const getpropModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		await runShellAndAddToAcquisition(acq, client, 'getprop', 'getprop');
	},
	name: 'Device Properties',
};
