// based on https://github.com/bugbakery/transcribee/blob/f1733c9e3612e970715d955ec2717d885b5d1d88/frontend/src/styled.tsx
import { ReactHTML, createElement, forwardRef } from 'react';

export function reactHtmlWithClassname<T extends keyof ReactHTML>(type: T, className: string) {
	const C = forwardRef((props: JSX.IntrinsicElements[T], ref) => {
		return createElement(type, {
			...props,
			className: `${className} ${props.className}`,
			ref,
		});
	});

	C.displayName = `${type} style="${className}"`;
	return C;
}
