import { ReactElement, useState } from 'react';
import { Button } from './input';

export type StepProps = { setCanGoNext: (v: boolean) => void };
export function Stepper({ steps }: { steps: ((props: StepProps) => JSX.Element)[] }) {
	const [componentCanGoNext, setComponentCanGoNext] = useState(true);
	const [activeStep, setActiveStep] = useState(0);
	if (steps.length <= activeStep && activeStep > 0) {
		setActiveStep(steps.length - 1);
		setComponentCanGoNext(true);
	}
	const prevStep = () => {
		setActiveStep(activeStep - 1);
		setComponentCanGoNext(true);
	};
	const nextStep = () => {
		setActiveStep(activeStep + 1);
		setComponentCanGoNext(true);
	};
	const canGoNextStep = activeStep + 1 < steps.length && componentCanGoNext;
	const canGoPrevStep = activeStep > 0;
	const CurrentStep = steps[activeStep];
	return (
		<div>
			<div>
				<CurrentStep setCanGoNext={setComponentCanGoNext} />
			</div>
			<div className="flex justify-between mt-4">
				{activeStep > 0 ? (
					<Button onClick={prevStep} disabled={!canGoPrevStep}>
						Previous Step
					</Button>
				) : (
					<div />
				)}
				{activeStep + 1 < steps.length ? (
					<Button onClick={nextStep} disabled={!canGoNextStep}>
						Next Step
					</Button>
				) : (
					<div />
				)}
			</div>
		</div>
	);
}

export function Step({ children }: { children: ReactElement | ReactElement[] }) {
	return <>{children}</>;
}
