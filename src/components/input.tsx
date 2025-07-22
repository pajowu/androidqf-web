import { ComponentProps } from 'react';

export function Input({ label, ...props }: ComponentProps<'input'> & { label: string }) {
	return (
		<label>
			{label}
			<input {...props} className="border p-1 rounded-lg dark:bg-neutral-900"></input>
		</label>
	);
}

export function Select({ label, ...props }: ComponentProps<'select'> & { label: string }) {
	return (
		<label>
			{label}
			<select {...props} className="border p-1 rounded-lg dark:bg-neutral-900"></select>
		</label>
	);
}

export function Button({ ...props }: ComponentProps<'button'>) {
	return (
		<button
			{...props}
			className="p-4 rounded-lg border border-gray-200 dark:border-gray-400 hover:shadow-lg hover:scale-105 transition-all break-word bg-white dark:bg-neutral-900 disabled:text-neutral-500 disabled:border-neutral-500"
		/>
	);
}

export function Checkbox({ label, ...props }: ComponentProps<'input'> & { label: string }) {
	return (
		<label>
			<input type="checkbox" className="mr-1" {...props} />
			{label}
		</label>
	);
}
