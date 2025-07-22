import { AdbClient } from 'wadb';
import { Module } from '.';
import { RootState } from '../state';
import { Acquisition, runShellAndAddToAcquisition } from '../utils/acquisition';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { Select } from '../components/input';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getHashData } from '../utils/getHashData';

type PackageInfo = {
	name: string;
	installer: string;
	disabled: boolean;
	system: boolean;
	third_party: boolean;
	files: PackageFile[];
};

type PackageFile = {
	path: string;
	md5: string;
	sha1: string;
	sha256: string;
	sha512: string;
};

type KeyOfType<T, V> = keyof {
	[P in keyof T as T[P] extends V ? P : never]: unknown;
};

const FIELD_ARGS: { field: KeyOfType<PackageInfo, boolean>; arg: string }[] = [
	{ field: 'disabled', arg: '-d' },
	{ field: 'system', arg: '-s' },
	{ field: 'third_party', arg: '-3' },
];

const HASHES: KeyOfType<PackageFile, string>[] = ['md5', 'sha1', 'sha256', 'sha512'];

function trimPrefix(input: string, prefix: string): string {
	if (input.startsWith(prefix)) {
		return input.slice(prefix.length);
	}
	return input;
}
async function runPmAndPreParse(client: AdbClient, args: string): Promise<[string, string][]> {
	const packageList = await client.shell(`pm list packages ${args}`);

	const packageData: [string, string][] = [];
	for (const line of packageList.trim().split('\n')) {
		const [packageName, data] = line.split(/\s+/, 2);
		const parsedPackageName = trimPrefix(packageName, 'package:');
		packageData.push([parsedPackageName, data]);
	}
	return packageData;
}

async function getPackageFiles(client: AdbClient, packageName: string): Promise<PackageFile[]> {
	const fileList = await client.shell(`pm path ${packageName}`);
	const files: PackageFile[] = [];
	for (const line of fileList.trim().split('\n')) {
		const packagePath = trimPrefix(line, 'package:');
		const file: PackageFile = {
			path: packagePath,
			md5: '',
			sha1: '',
			sha256: '',
			sha512: '',
		};
		for (const hash of HASHES) {
			// TODO: Handle status code != 0
			const out = await client.shell(`${hash}sum ${packagePath}`);
			file[hash] = out.split(' ', 1)[0];
		}
		files.push(file);
	}
	return files;
}

async function getPackages(client: AdbClient): Promise<PackageInfo[]> {
	const packages: PackageInfo[] = [];

	for (const [packageName, rawInstaller] of await runPmAndPreParse(client, '-u -i')) {
		const installer = trimPrefix(rawInstaller, 'installer=');

		packages.push({
			name: packageName,
			installer: installer,
			disabled: false,
			system: false,
			third_party: false,
			files: await getPackageFiles(client, packageName),
		});
	}

	for (const { field, arg } of FIELD_ARGS) {
		for (const [packageName, _] of await runPmAndPreParse(client, arg)) {
			for (const pkg of packages) {
				if (pkg.name == packageName) {
					pkg[field] = true;
				}
			}
		}
	}

	return packages;
}

function getPathToLocalCopy(packageName: string, path: string): string {
	let fileName = `packages/apks/${packageName}/`;
	if (path.includes('==/')) {
		fileName += '_' + path.split('==/')[1].replace('.apk', '');
	}
	// TODO: Avoid collisions
	return `${packageName}${fileName}.apk`;
}

enum Mode {
	All = 'All',
	NotSystem = 'Only non-system packages',
	None = 'Do not download any',
}
export type PackagesSlice = { mode: Mode };

function getInitialState(): PackagesSlice {
	const hashData = getHashData();
	let mode = Mode.None;
	if ('packages.mode' in hashData && hashData['packages.mode'] == 'all') {
		mode = Mode.All;
	} else if ('packages.mode' in hashData && hashData['packages.mode'] == 'notsystem') {
		mode = Mode.NotSystem;
	}
	return { mode };
}
export const packagesSlice = createSlice({
	name: 'package',
	initialState: getInitialState,
	reducers: {
		setMode: (slice, action: PayloadAction<Mode>) => {
			slice.mode = action.payload;
		},
	},
});

const { setMode } = packagesSlice.actions;

export const packagesModule: Module = {
	render: () => {
		const mode = useAppSelector((state) => state.packages.mode);
		const dispatch = useAppDispatch();

		return (
			<>
				<Select
					label="Download: "
					value={mode}
					onChange={(e) => dispatch(setMode(e.target.value as Mode))}
				>
					{Object.values(Mode).map((x) => (
						<option key={x} value={x}>
							{x}
						</option>
					))}
				</Select>
			</>
		);
	},
	run: async (acq: Acquisition, client: AdbClient, state: RootState, _errorCallback) => {
		await runShellAndAddToAcquisition(
			acq,
			client,
			'pm query-activities --brief -a android.intent.action.MAIN -c android.intent.category.LAUNCHER',
			`packages/launcher_activites`,
		);
		const packages = await getPackages(client);
		acq.addFileFromString('packages/packages.json', JSON.stringify(packages));

		const packagesToDownload = packages.filter(
			(pkg) =>
				state.packages.mode === Mode.All || (state.packages.mode === Mode.NotSystem && !pkg.system),
		);
		for (const pkg of packagesToDownload) {
			for (const file of pkg.files) {
				const localPath = 'packages/' + getPathToLocalCopy(pkg.name, file.path);
				await acq.addFileFromReadableStream(
					`packages/${localPath}`,
					await client.pullAsStream(file.path),
				);
			}
		}
	},
	name: 'Packages',
};
