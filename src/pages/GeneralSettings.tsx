import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setAgeRecipient, setEncrypt } from '../state/general';
import { Checkbox, Input } from '../components/input';
import { Heading2, Paragraph, WarnParagraph } from '../components/typography';
import { isValidAgeRecipient } from '../utils/encryption';
import { useEffect } from 'react';
import { StepProps } from '../components/stepper';

export function GeneralSettings({ setCanGoNext }: StepProps) {
	const generalState = useAppSelector((state) => state.general);
	const dispatch = useAppDispatch();
	useEffect(() => {
		setCanGoNext(!generalState.encrypt || isValidAgeRecipient(generalState.ageRecipient));
	}, [generalState.encrypt, generalState.ageRecipient]);

	return (
		<>
			<Heading2 className="mb-4">Settings</Heading2>
			<Paragraph>
				Below you can select whether you want to encrypt the generated archive with an age public
				key.
			</Paragraph>
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
				{generalState.encrypt &&
					generalState.ageRecipient &&
					!isValidAgeRecipient(generalState.ageRecipient) && (
						<WarnParagraph>
							This is not a valid age public key. Please check again before continuing.
						</WarnParagraph>
					)}
			</div>
		</>
	);
}
