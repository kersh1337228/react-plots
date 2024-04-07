export function round(
	x: number,
	digits: number = 0
): number {
	return Math.round(
		(x + Number.EPSILON) * 10 ** digits
	) / 10 ** digits;
}

const symbols = [
	[1000000000, 'B'],
	[1000000, 'M'],
	[1000, 'K'],
] as [number, string][];

export function numberPower(
	x: number,
	digits: number = 0
): string {
	for (const [value, symbol] of symbols)
		if (value <= x)
			return `${round(x / value, digits)}${symbol}`;

	return String(round(x, digits));
}

export function truncate(
	x: number,
	min: number = -Infinity,
	max: number = Infinity
): number {
	return x < min ? min : x > max ? max : x;
}

export function range(
	start: number,
	stop: number,
	step: number = 1
): number[] {
	const n = Math.floor((stop - start) / step);
	const rng = new Array<number>(n);

	for (let i = 0; i < n; ++i)
		rng[i] = start + step * i;
	return rng;
}
