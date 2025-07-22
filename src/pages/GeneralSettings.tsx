import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setAgeRecipient, setEncrypt } from '../state/general';
import { Checkbox, Input } from '../components/input';
import { Heading2 } from '../components/headings';

export function GeneralSettings() {
	const generalState = useAppSelector((state) => state.general);
	const dispatch = useAppDispatch();

	return (
		<>
			<Heading2 className="mb-4">General Settings</Heading2>
			<div className="flex flex-col">
				<Checkbox
					label="Encrypt archive"
					checked={generalState.encrypt}
					onChange={(e) => dispatch(setEncrypt(e.target.checked))}
				/>
				{generalState.encrypt && (
					<Input
						label="Recipient Age Key: "
						value={generalState.ageRecipient}
						onChange={(e) => dispatch(setAgeRecipient(e.target.value))}
					/>
				)}
			</div>
		</>
	);
}
