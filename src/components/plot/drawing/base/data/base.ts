import {
    PlotData,
    PointNumeric
} from '../../../../../utils/types/plotData';
import {
    Bounds,
    DataRange
} from '../../../../../utils/types/display';
import Drawing from '../Drawing';

export declare type DataBounds = {
    x: Bounds;
    y: Bounds;
};

export default abstract class DrawingData<
    DataT extends PlotData
> {
    public readonly global: DataBounds = {
        x: {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        },
        y: {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        }
    };
    public local: DataBounds = {
        x: {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        },
        y: {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        }
    };

    protected constructor(
        protected readonly drawing: Drawing<any, any>,
        public readonly data: DataT[]
    ) {}

    public localize(
        range: DataRange
    ) {
        this.local.x = {
            min: range.start * this.global.x.max,
            max: range.end * this.global.x.max
        };
    }

    public abstract globalize(
        localX: number
    ): number;

    public abstract point(
        at: number
    ): PointNumeric;

    public abstract tooltip(
        localX: number
    ): React.JSX.Element;
}
