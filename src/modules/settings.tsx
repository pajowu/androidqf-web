import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, runShellAndAddToAcquisition } from '../utils/acquisition';

const NAMESPACES = ['system', 'secure', 'global'];

export const settingsModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state: RootState) => {
		for (const namespace of NAMESPACES) {
			await runShellAndAddToAcquisition(
				acq,
				client,
				`cmd settings list ${namespace}`,
				`settings_${namespace}`,
			);
		}
	},
	name: 'Settings',
};
