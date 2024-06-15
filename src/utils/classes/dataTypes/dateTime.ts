export class Duration {
	public readonly format: string;
	private constructor(
		private readonly duration: number
	) {
		if (duration >= 31536000000)
			this.format = '%Y';
		else if (duration >= 2592000000)
			this.format = '%Y-%m';
		else if (duration >= 86400000)
			this.format = '%Y-%m-%d';
		else if (duration >= 3600000)
			this.format = '%Y-%m-%d %H';
		else if (duration >= 60000)
			this.format = '%Y-%m-%d %H:%M';
		else
			this.format = '%Y-%m-%d %H:%M:%S';
	}
	// Constructors
	public static milliseconds(n: number): Duration {
		return new Duration(n)
	};

	public static seconds(n: number): Duration {
		return new Duration(n * 1000);
	};

	public static minutes(n: number): Duration {
		return new Duration(n * 1000 * 60);
	};

	public static hours(n: number): Duration {
		return new Duration(n * 1000 * 60 * 60);
	};

	public static days(n: number): Duration {
		return new Duration(n * 1000 * 60 * 60 * 24);
	};

	public static years(n: number): Duration {
		return new Duration(n * 1000 * 60 * 60 * 24 * 365);
	};

	public static month(n: number): Duration {
		return new Duration(n * 1000 * 60 * 60 * 24 * 365 / 12);
	};
	// Duration Components
	public get milliseconds() {
		return Math.floor(this.duration);
	};

	public get seconds(): number {
		return Math.floor(this.milliseconds / 1000);
	};

	public get minutes(): number {
		return Math.floor(this.seconds / 60);
	};

	public get hours(): number {
		return Math.floor(this.minutes / 60);
	};

	public get days(): number {
		return Math.floor(this.hours / 24);
	};

	public get months(): number {
		return Math.floor(this.days / 30);
	};

	public get years(): number {
		return Math.floor(this.days / 365);
	};
}

export class DateTime {
	private readonly obj: Date;
	private readonly str: string;
	private static readonly regex: RegExp = /^((19|20)\d{2})(-((0[1-9])|(1[0-2]))(-((0[1-9])|([1-2]\d)|(3[0-1])))?)?( (([0-1]\d)|(2[0-3])):([0-5]\d)(:[0-5]\d)?)?$/;

	public constructor(
		datetime: string | Date | DateTime
	) {
		if (datetime instanceof Date) {
			this.obj = datetime;
			this.str = datetime.toLocaleString('sv');
		} else if (datetime instanceof DateTime) {
			this.obj = datetime.obj;
			this.str = datetime.str;
		} else {
			if (DateTime.regex.test(datetime)) {
				this.str = datetime;
				this.obj = new Date(datetime);
			} else
				throw Error('Wrong datetime string format.');
		}
	}
	// DateTime Components
	public get year(): number {
		return this.obj.getFullYear();
	};

	public get month(): number {
		return this.obj.getMonth() + 1;
	};

	public get day(): number {
		return this.obj.getDate();
	};

	public get hour(): number {
		return this.obj.getHours();
	};

	public get minute(): number {
		return this.obj.getMinutes();
	};

	public get second(): number {
		return this.obj.getSeconds();
	};

	// Utilities
	public format(
		fstring: string
	): string {
		return fstring.replaceAll(
			'%Y', String(this.year)
		).replaceAll(
			'%m', this.month < 10 ? `0${this.month}` : String(this.month)
		).replaceAll(
			'%d', this.day < 10 ? `0${this.day}` : String(this.day)
		).replaceAll(
			'%H', this.hour < 10 ? `0${this.hour}` : String(this.hour)
		).replaceAll(
			'%M', this.minute < 10 ? `0${this.minute}` : String(this.minute)
		).replaceAll(
			'%S', this.second < 10 ? `0${this.second}` : String(this.second)
		);
	}

	public get string(): string {
		return this.str;
	}

	public get object(): Date {
		return this.obj;
	}

	public static diff(
		dtA: DateTime | Date | string,
		dtB: DateTime | Date | string
	): Duration {
		return Duration.milliseconds(
			// @ts-ignore
			new DateTime(dtA).object - new DateTime(dtB).object
		);
	}
}
