import { ComponentProps } from 'react';

export function Link({ href, children }: ComponentProps<'a'>) {
	return (
		<a target="_blank" rel="noreferrer" href={href} className="underline text-blue-600">
			{children}
		</a>
	);
}
