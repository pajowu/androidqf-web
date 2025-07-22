import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, addShellResultToAcquisition } from '../utils/acquisition';

export const dumpsysModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		const dumpsys = await client.shellV2('dumpsys');
		await addShellResultToAcquisition(dumpsys, acq, 'dumpsys');
	},
	name: 'Dumpsys',
};
