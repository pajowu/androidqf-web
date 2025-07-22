import { AdbClient } from 'wadb';
import { dumpsysModule } from './dumpsys';
import { envModule } from './env';
import { RootState } from '../state';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Acquisition } from '../utils/acquisition';
import { backupModule, backupSlice } from './backup';
import { getHashData } from '../utils/getHashData';
import { logcatModule } from './logcat';
import { getpropModule } from './getprop';
import { logsModule } from './logs';
import { packagesModule, packagesSlice } from './packages';
import { processesModule } from './processes';
import { settingsModule } from './settings';

export type ModuleRunFunction = (
	storage: Acquisition,
	client: AdbClient,
	state: RootState,
	errorCallback: (e: string) => void,
) => Promise<void>;

export interface Module {
	render: () => JSX.Element;
	run: ModuleRunFunction;
	name: string;
};

export const ALL_SLICES = { backup: backupSlice, packages: packagesSlice } as const;
export const ALL_MODULES = {
	dumpsys: dumpsysModule,
	env: envModule,
	backup: backupModule,
	logcat: logcatModule,
	getprop: getpropModule,
	logs: logsModule,
	packages: packagesModule,
	processes: processesModule,
	settings: settingsModule
} as const;

export type ModulesState = {
	[k in keyof typeof ALL_MODULES]: { active: boolean; running: boolean };
};

function getInitialState(): ModulesState {
	const hashData = getHashData();
	const activeModules =
		'modules.active' in hashData ? hashData['modules.active'].split(',') : Object.keys(ALL_MODULES);

	return Object.fromEntries(
		Object.keys(ALL_MODULES).map((x) => [x, { active: activeModules.includes(x), running: false }]),
	) as ModulesState;
}

export const modulesSlice = createSlice({
	name: 'modules',
	initialState: getInitialState,
	reducers: {
		setActiveState: (
			slice,
			action: PayloadAction<{ module: keyof ModulesState; active: boolean }>,
		) => {
			slice[action.payload.module].active = action.payload.active;
		},
		setRunningState: (
			slice,
			action: PayloadAction<{ module: keyof ModulesState; running: boolean }>,
		) => {
			slice[action.payload.module].running = action.payload.running;
		},
	},
});
