export default abstract class TypedRange<T> {
	protected readonly container: T[]

	protected constructor(
		init: T[] = []
	) {
		this.container = init
	};

	public at(
		i: number
	): T | undefined {
		return this.container.at(i);
	};

	public abstract slice(
		start: number,
		end: number
	): TypedRange<T>;

	public abstract format(
		fstring: string
	): string[];

	public abstract formatAt(
		i: number,
		fstring: string
	): string | undefined;

	public [Symbol.iterator]() {
		let i = -1;
		return {
			next: () => ({
				value: this.container[++i],
				done: !(i in this.container)
			})
		};
	};

	public get length() {
		return this.container.length;
	};
}
