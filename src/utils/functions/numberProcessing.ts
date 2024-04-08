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
	const abs = Math.abs(x);
	for (const [value, symbol] of symbols)
		if (value <= abs)
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

export function epsComp(
	tol: number = Number.EPSILON
) {
	return (
		a: number,
		b: number
	) => {
		const dist = a - b;
		return Math.abs(dist) <= tol ? 0 : dist < tol ? -1 : 1;
	};
}

export function unique<
	DataT extends any
>(
	array: DataT[],
	comparator: (
		a: DataT,
		b: DataT
	) => -1 | 0 | 1
) {
	const container = new Array<DataT>();

	for (const val of array)
		if (!container.some(unique => !comparator(unique, val)))
			container.push(val);

	return container.sort(comparator);
}
