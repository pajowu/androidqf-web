export function Spinner({
	isSpinning,
	className = '',
}: {
	isSpinning: boolean;
	className?: string;
}) {
	return (
		isSpinning && (
			<div
				className={`inline-block animate-spin rounded-[100%] border-4 divide-solid w-6 h-6 before:absolute before:border-4 before:border-t-black before:rounded-[100%] before:h-6 before:w-6 before:-left-1 before:-top-1 ${className}`}
			></div>
		)
	);
}
