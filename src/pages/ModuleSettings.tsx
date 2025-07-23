import { useState } from 'react';
import { AdbClient } from 'wadb';
import { ALL_MODULES, Module, ModuleRunFunction, ModulesState, modulesSlice } from '../modules';

import { RootState, store } from '../state';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { Spinner } from '../components/spinner';
import { Acquisition } from '../utils/acquisition';
import { Heading2, Paragraph } from '../components/typography';
import { Checkbox } from '../components/input';

export function ModuleSettings() {
	return (
		<>
			<Heading2 className="mb-4">Select Modules</Heading2>
			<Paragraph>
				Below you can select which data should be collected. Once you selected the data you want to
				collect, press the "Run" button to start the data collection process. This may take some
				minutes and you need to confirm the collection on your phone.
			</Paragraph>
			<ModuleCards />
			<ModuleRunButton />
		</>
	);
}

export function ModuleCard({
	module,
	isActive,
	isRunning,
	setIsActive,
}: {
	module: Module;
	isActive: boolean;
	isRunning: boolean;
	setIsActive: (active: boolean) => void;
}) {
	const Component = module.render;
	return (
		<>
			<div className="border border-gray-200 dark:border-gray-400 relative first:rounded-t-lg">
				<div className="p-4 pb-2 flex justify-between align-middle">
					<Checkbox
						checked={isActive}
						onChange={(e) => setIsActive(e.target.checked)}
						label={module.name}
					/>
					<Spinner isSpinning={isRunning} />
				</div>
				<div className="p-4 pt-2 empty:pb-0">{isActive && <Component />}</div>
			</div>
		</>
	);
}

export function ModuleRunButton() {
	const [error, setError] = useState(null as string | null);
	const dispatch = useAppDispatch();
	const client: AdbClient | null = useAppSelector((state) => state.client.client);
	const moduleState: ModulesState = useAppSelector((state: RootState) => state.modules);
	const isRunning = Object.values(moduleState).some((x) => x.running);
	const canRun = client !== null && !isRunning && Object.values(moduleState).some((x) => x.active);
	const bg_color = canRun ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600';
	return (
		<>
			{error && (
				<div className="bg-red-200 dark:bg-red-700 p-4 border whitespace-pre">
					<details>
						<summary>An error occurred during data collection. Click here to show more</summary>
						{error}
					</details>
				</div>
			)}
			<button
				className={`${bg_color} w-full p-4 text-white text-xl font-bold rounded-b-lg border`}
				onClick={async () => {
					if (client === null) {
						return;
					}
					const state: RootState = store.getState();
					const fileHandle = await window.showSaveFilePicker({ suggestedName: 'archive' });
					const acq: Acquisition = new Acquisition(
						await fileHandle.createWritable(),
						state.general.encrypt ? state.general.ageRecipient : null,
					);
					setError('');
					try {
						const funcs_to_run = Object.entries(ALL_MODULES)
							.map(([k, v]) =>
								state.modules[k].active ? ([k, v.run] as [string, ModuleRunFunction]) : null,
							)
							.filter((x): x is Exclude<typeof x, null> => x !== null);
						for (const [name, func] of funcs_to_run) {
							dispatch(
								modulesSlice.actions.setRunningState({
									module: name as keyof typeof ALL_MODULES,
									running: true,
								}),
							);
							await func(acq, client, state, (e) =>
								setError((curErr) => {
									if (curErr) {
										return curErr + '\n' + e;
									}
									return e;
								}),
							);
							dispatch(
								modulesSlice.actions.setRunningState({
									module: name as keyof typeof ALL_MODULES,
									running: false,
								}),
							);
						}

						await acq.close();
					} catch (e: unknown) {
						console.error(e);
						setError((e as Error).toString());
					}
				}}
				disabled={client === null || isRunning}
			>
				<div className="flex justify-center">
					<Spinner isSpinning={isRunning} className="mr-2" />
					Run
				</div>
			</button>
		</>
	);
}
export function ModuleCards() {
	const moduleState = useAppSelector((state) => state.modules);
	const dispatch = useAppDispatch();
	return (
		<div>
			{Object.entries(ALL_MODULES).map(([k, v]) => (
				<ModuleCard
					key={k}
					module={v}
					isActive={moduleState[k].active}
					isRunning={moduleState[k].running}
					setIsActive={(active: boolean) =>
						dispatch(
							modulesSlice.actions.setActiveState({
								module: k as keyof typeof ALL_MODULES,
								active,
							}),
						)
					}
				/>
			))}
		</div>
	);
}
