import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition } from '../utils/acquisition';

export const fakedataModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, _client: AdbClient, _state: RootState) => {
		const data = [];
		for (let i = 0; i < 512 * 2; i++) {
			data.push(new ArrayBuffer(1024 * 1023));
		}
		const blob = new Blob(data);
		await acq.addFileFromBlob('fake', blob);
	},
	name: 'Fake Data',
};
