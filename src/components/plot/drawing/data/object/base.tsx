import DrawingData from '../base';
import {
    ObjectNumeric,
    Object as ObjecT
} from '../../../../../utils_refactor/types/plotData';
import {
    round
} from '../../../../../utils_refactor/functions/numberProcessing';
import {
    DataRange
} from '../../../../../utils_refactor/types/display';
import Drawing from '../../Drawing';

export default abstract class ObjectData<
    DataT extends ObjecT
> extends DrawingData<
    DataT
> {
    protected constructor(
        drawing: Drawing<any, any>,
        data: DataT[],
        public vfield: string
    ) {
        super(drawing, data);

        this.global.y = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        };
        for (const {
            [vfield]: y
        } of data) {
            if (y !== null) {
                this.global.y.min = y < this.global.y.min ? y : this.global.y.min;
                this.global.y.max = this.global.y.max < y ? y : this.global.y.max;
            }
        }
    }

    public override localize(
        range: DataRange
    ) {
        super.localize(range);

        this.local.y = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE
        };
        const start = Math.floor(this.data.length * range.start),
            end = Math.ceil(this.data.length * range.end);
        for (let i = start; i < end; ++i) {
            const {
                [this.vfield]: y
            } = this.data[i];
            if (y !== null) {
                this.local.y.min = y < this.local.y.min ? y : this.local.y.min;
                this.local.y.max = this.local.y.max < y ? y : this.local.y.max;
            }
        }
    }

    public override tooltip(
        localX: number
    ) {
        const point = this.data[this.globalize(localX)];
        return <li key={this.drawing.name} className={'drawingTooltips'}>
            <ul>
                {Object.entries(point).map(([key, value]) =>
                    <li key={key}>{this.drawing.name}: {round(value as number, 2)}</li>
                )}
            </ul>
        </li>;
    }
}
