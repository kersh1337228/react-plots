export default abstract class TypedRange<
	DataT extends any,
	FreqT extends any
> {
	protected readonly container: DataT[]

	protected constructor(
		init: DataT[] = [],
		public readonly freq: FreqT,
		public readonly step: number
	) {
		this.container = init;
	};

	public at(
		i: number
	): DataT | undefined {
		return this.container.at(i);
	};

	public abstract slice(
		start: number,
		end: number
	): TypedRange<DataT, FreqT>;

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
