import { AdbClient } from 'wadb';
import { Module } from '.';
import { Acquisition } from '../utils/acquisition';

// taken from https://github.com/mvt-project/androidqf/blob/facb7a02e30e81dcf5f35d3597c8403b93b47418/modules/logs.go
const LOGFILES = [
	'/data/system/uiderrors.txt',
	'/proc/kmsg',
	'/proc/last_kmsg',
	'/sys/fs/pstore/console-ramoops',
];

const LOGDIRS = ['/data/anr/', '/data/log/', '/sdcard/log/'];

async function listFiles(client: AdbClient, path: string): Promise<Array<string>> {
	const fileList = await client.shell(`find ${path} -type f 2> /dev/null`);
	return fileList.split('\n').filter((x) => x !== '');
}

async function addFiles(
	acq: Acquisition,
	client: AdbClient,
	files: string[],
	errorCallback: (e: string) => void,
) {
	for (const file of files) {
		try {
			await acq.addFileFromReadableStream(`logs/${file}`, await client.pullAsStream(file));
		} catch (e) {
			const err = e as Error;
			errorCallback(err.message);
		}
	}
}
export const logsModule: Module = {
	render: () => {
		return <></>;
	},
	run: async (acq: Acquisition, client: AdbClient, _state, errorCallback: (e: string) => void) => {
		await addFiles(acq, client, LOGFILES, errorCallback);
		for (const logdir of LOGDIRS) {
			const files = await listFiles(client, logdir);
			await addFiles(acq, client, files, errorCallback);
		}
	},
	name: 'Logs',
};
