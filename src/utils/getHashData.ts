export function getHashData() {
	const hash = window.location.hash;
	if (!hash) {
		return {};
	}

	return Object.fromEntries(
		hash
			.slice(1)
			.split('&')
			.map((x) => {
				const split = x.split('=', 2);
				if (split.length == 1) {
					split.push('');
				}
				return split;
			}),
	);
}
